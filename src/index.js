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
const BoardsController = require('../src/controllers/BoardsController')


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

            socket.on('BOARD_CHANGE', async (data) => {
                const newBoard = await BoardsController.updateBoard(data)
                console.log({newBoard})
                const boardId = data._id
                io.in(boardId).emit('BOARD_CHANGED', newBoard)
            })

            socket.on('COLUMN_ADD', async (column) => {
                const clients = socket.adapter.rooms.get(column.boardId);
                console.log(column, socket.id, 'clients:', clients)
                const newColumn = await ColumnsController.newColumn(column)
                io.in(column.boardId).emit('COLUMN_ADDED', newColumn)
            })

            socket.on('COLUMN_DELETE', async (columnId) => {
                const currentBoard = await ColumnsController.deleteColumn(columnId)
                const boardId = currentBoard._id.toString()
                const columnIds = currentBoard.columns
                const data = {columnId, columnIds}
                io.in(boardId).emit('COLUMN_DELETED', data)
            })

            socket.on('COLUMN_CHANGE', async (data) => {
                const currentColumn = await ColumnsController.updateColumn(data)
                const boardId = currentColumn.boardId.toString()
                io.in(boardId).emit('COLUMN_CHANGED', currentColumn)
            })

            socket.on('CARD_ADD', async (data) => {
                const cardData = await CardsController.newCard(data)
                const boardId = cardData.boardId.toString()
                io.in(boardId).emit('CARD_ADDED', cardData.cardNew)
            })
            socket.on('CARD_DELETE', async (cardId) => {

             const cardData =   await CardsController.deleteCard(cardId)
                const boardId = cardData.toString()
                io.in(boardId).emit('CARD_DELETED', cardId)
            })
            socket.on('CARD_DROP', async (data) => {
                const boardId = await CardsController.dragAndDropCard(data)
                io.in(boardId.toString()).emit('CARD_DROPPED', data)
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