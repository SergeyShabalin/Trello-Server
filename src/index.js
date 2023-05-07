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
const ChecklistController = require('../src/controllers/ChecklistController')
const UserController = require('../src/controllers/UserController')


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

            socket.on('JOIN_USER', (userId) => {
                console.log({userId})
                socket.join(userId)
                console.log(`user ${socket.id} получил слушатель ${userId}`)
            })
            // socket.on('LEAVE_USER', (userId) => {
            //     socket.leave(userId)
            //     console.log(`user ${socket.id} удалил слушатель ${userId}`)
            //     socket.disconnect()
            // })
            //TODO пофиксить notification 118 124 строки userController
            socket.on('SHARE_BOARD', async (data) => {
                const targetUser = await UserController.shareBoard(data)
                const targetUserId = targetUser._id.toString()
                console.log(targetUser.messages)
                io.in(targetUserId).emit('BOARD_SHARED', targetUser.messages)
            })

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
                const cardData = await CardsController.deleteCard(cardId)
                const boardId = cardData.toString()
                io.in(boardId).emit('CARD_DELETED', cardId)
            })
            socket.on('CARD_DROP', async (data) => {
                const boardId = await CardsController.dragAndDropCard(data)
                io.in(boardId.toString()).emit('CARD_DROPPED', data)
            })
            socket.on('CARD_CHANGE', async (data) => {
                const card = await CardsController.updateCard(data)
                io.in(card.boardId).emit('CARD_CHANGED', card.changedCard)
            })

            socket.on('TASK_ADD', async (data) => {
                const task = await ChecklistController.newTask(data)
                const boardId = task.boardId.toString()
                io.in(boardId).emit('TASK_ADDED', task)
            })
            socket.on('TASK_CHANGE', async (data) => {
                const task = await ChecklistController.updateTask(data)
                io.in(task.boardId).emit('TASK_CHANGED', task)
            })
            socket.on('TASK_DELETE', async (data) => {
                const task = await ChecklistController.deleteTask(data)
                io.in(task.boardId).emit('TASK_DELETED', task)
            })

            socket.on('COLUMN_DROP', async (data) => {
                const currentBoard = await ColumnsController.dragDropColumn(data)
                io.in(currentBoard._id.toString()).emit('COLUMN_DROPPED', currentBoard.columns)
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