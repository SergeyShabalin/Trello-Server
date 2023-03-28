require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express()
const http = require("http")
const {Server} = require("socket.io");
const server = http.createServer(app)

const router = require('./routes/index')
const ColumnsRouter = require('./routes/columns')
const CardsRouter = require('./routes/cards')
const BoardRouter = require('./routes/boards')
const UserRouter = require('./routes/users')
const ChecklistRouter = require('./routes/checklist')
const CardsController = require('../src/controllers/CardsController')
const ColumnsController = require('../src/controllers/ColumnsController')


const io = new Server(server, {
    cors: {
        credentials: true,
        methods: ['GET', 'POST'],
        origin: process.env.CLIENT_URL
    }
})

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use('/api', router);
app.use('/columns', ColumnsRouter);
app.use('/cards', CardsRouter);
app.use('/boards', BoardRouter);
app.use('/checklist', ChecklistRouter);
app.use('/user', UserRouter);


const start = async (eventName, listener) => {
    try {

        io.on('connection', function (socket) {

            socket.on('JOIN_BOARD', (BoardId) => {
                socket.join(BoardId)
                console.log(`user ${socket.id} подписался на доску ${BoardId}`)
                const clients = socket.adapter.rooms.get(BoardId);
                console.log('clients:', clients)
            })

            socket.on('LEAVE_BOARD', (BoardId) => {
                socket.leave(BoardId)
                console.log(`user ${socket.id} отписался от доски ${BoardId}`)
                const clients = socket.adapter.rooms.get(BoardId);
                console.log('clients:', clients)
                socket.disconnect()
            })

            socket.on('COLUMN_ADD', async(column) => {
                const clients = socket.adapter.rooms.get(column.boardId);
                console.log(column, socket.id, 'clients:', clients)
                const newColumn = await ColumnsController.newColumn(column)
                io.in(column.boardId).emit('COLUMN_ADDED', newColumn)

            })
             console.log('A user connected', socket.id);
        });



        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        server.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}
start()