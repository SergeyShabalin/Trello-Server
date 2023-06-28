require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const server = http.createServer(app);
const router = require('./routes/index');
const ColumnsRouter = require('./routes/columns');
const CardsRouter = require('./routes/cards');
const BoardRouter = require('./routes/boards');
const UserRouter = require('./routes/users');
const ChecklistRouter = require('./routes/checklist');
const CardsController = require('../src/controllers/CardsController');
const ColumnsController = require('../src/controllers/ColumnsController');
const BoardsController = require('../src/controllers/BoardsController');
const ChecklistController = require('../src/controllers/ChecklistController');
const UserController = require('../src/controllers/UserController');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CardModel = require("./models/cards-model");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/images');
    },
    filename: (req, file, cb) => {
        cb(null, path.extname(file.originalname) + '-' + Date.now());
    },
});

const upload = multer({storage: storage});

cloudinary.config({
    cloud_name: 'dwkxptye4',
    api_key: '246311834185549',
    api_secret: 'aU1Xs0e6hPwtAcLPLZkad5HLyM0',
});

app.use(express.json());
app.use(cors()); // Подключение промежуточного ПО cors() перед определением маршрутов
app.use(upload.single('background'));
app.use('/api', router);
app.use('/columns', ColumnsRouter);
app.use('/cards', CardsRouter);
app.use('/boards', BoardRouter);
app.use('/checklist', ChecklistRouter);
app.use('/user', UserRouter);


app.post('/user/sendIMG', (req, res) => {
    const file = req.file;

    cloudinary.uploader.upload(file.path, {public_id: file.originalname+'background'}, (error, result) => {
        if (error) {
            return res.status(400).json({error: 'Ошибка загрузки файла'});
        }
        let imageUrl = result.secure_url;
        const payload = {
            userId: file.originalname,
            background: imageUrl
        };
        if (imageUrl) {
            UserController.downloadBackground(payload);
        }

        // Удаление файла после загрузки
        fs.unlink(file.path, (error) => {
            if (error) {
                console.log('Ошибка удаления файла:', error);
            }
        });

        return res.json({background: imageUrl, _id: file.originalname});
    });
});

app.post('/user/sendAvatar', (req, res) => {
    const file = req.file;
    console.log(file);

    cloudinary.uploader.upload(file.path, {public_id: file.originalname+'avatar'}, (error, result) => {
        if (error) {
            return res.status(400).json({error: 'Ошибка загрузки файла'});
        }
        let imageUrl = result.secure_url;
        const payload = {
            userId: file.originalname,
            avatar: imageUrl
        };
        if (imageUrl) {
            UserController.downloadAvatar(payload);
        }

        // Удаление файла после загрузки
        fs.unlink(file.path, (error) => {
            if (error) {
                console.log('Ошибка удаления файла:', error);
            }
        });

        return res.json({avatar: imageUrl, _id: file.originalname});
    });
});


const io = new Server(server, {
    cors: {
        credentials: true,
        methods: ['GET', 'POST'],
        origin: process.env.CLIENT_URL || 'https://cloudinary.com'
    }
})

const PORT = process.env.PORT || 4000;


const start = async (eventName, listener) => {
    try {

        io.on('connection', function (socket) {

            socket.on('JOIN_USER', (userId) => {
                socket.join(userId)
                console.log(`user ${socket.id} получил слушатель ${userId}`)
            })
            // socket.on('LEAVE_USER', (userId) => {
            //     socket.leave(userId)
            //     console.log(`user ${socket.id} удалил слушатель ${userId}`)
            //     socket.disconnect()
            // })

            socket.on('SHARE_BOARD', async (data) => {
                const targetUser = await UserController.shareBoard(data)
                if (targetUser.errors) {
                    socket.emit('BOARD_SHARED', {error: targetUser.errors})
                } else {
                    const targetUserId = targetUser._id.toString()
                    socket.emit('BOARD_SHARED', {submit: 'Приглашение отправлено'})
                    io.in(targetUserId).emit('BOARD_SHARED', {messages: targetUser.messages})
                }

            })

            socket.on('JOIN_BOARD', (BoardId) => {
                socket.join(BoardId)
                console.log(`user ${socket.id} подписался на доску ${BoardId}`)
                const clients = socket.adapter.rooms.get(BoardId);
            })

            socket.on('LEAVE_BOARD', (BoardId) => {
                socket.leave(BoardId)
                console.log(`user ${socket.id} отписался от доски ${BoardId}`)
                const clients = socket.adapter.rooms.get(BoardId);
                socket.disconnect()
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

            socket.on('ADD_MEMBER_ONE_CARD', async (data) => {
                 const members = await CardsController.addMembersOneCard(data)
                 io.in(members.boardId.toString()).emit('CHANGE_COUNT_MEMBERS', members.users)
            })

            socket.on('CONVERT_TASK_TO_CARD', async (data) => {
                console.log(data)
                const currentCard =   await CardModel.findOne({_id: data.cardId})
                const currentColumnId = currentCard.column_id
                const payload = {
                 title: data.title,
                    column_id: currentColumnId
                }
                const cardData = await CardsController.newCard(payload)
                const boardId = cardData.boardId.toString()
                 io.in(boardId).emit('CARD_ADDED', cardData.cardNew)
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


