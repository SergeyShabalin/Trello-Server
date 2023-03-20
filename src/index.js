require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./routes/index')
const ColumnsRouter = require('./routes/columns')
const CardsRouter = require('./routes/cards')
const BoardRouter = require('./routes/boards')
const UserRouter = require('./routes/users')
const CardsController = require('../src/controllers/CardsController')
const ColumnsController = require('../src/controllers/ColumnsController')
const app = express()
const http = require('http')
const ChecklistRouter = require('./routes/checklist')

const server = http.createServer(app)
const {Server} = require("socket.io");
 const io = new Server(server, {
    cors: {
        credentials: true,
        origin: process.env.CLIENT_URL
    }
})



const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use('/api', router);
app.use('/columns', ColumnsRouter);
app.use('/cards', CardsRouter);
app.use('/boards', BoardRouter);
app.use('/checklist', ChecklistRouter);
app.use('/user', UserRouter);

const start = async () => {
    try {
        io.on('connection', function (socket) {
            socket.on('CARD_ADD', async (data) => {
                const newUser = await CardsController.newCard(data)
                io.emit('CARD_ADDED', newUser)
            })
            socket.on('COLUMN_ADD', async (column) => {
                console.log(column)
                 socket.join(column.boardId)
                // const newColumn = await ColumnsController.newColumn(data)
                    socket.broadcast.emit('COLUMN_ADDED', column)
                // io.to(data.boardId).emit('COLUMN_ADDED', data)
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