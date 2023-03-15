require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./routes/index')
const ColumnsRouter = require('./routes/columns')
const CardsRouter = require('./routes/cards')
const BoardRouter = require('./routes/boards')
const UserRouter = require('./routes/users')
const app = express()
const server = require('http').Server(app)
const controller = require('../src/controllers/CardsController')
const io = require('socket.io')(server, {
    cors: {
        credentials: true,
        origin: process.env.CLIENT_URL
    }
})

const ChecklistRouter = require('./routes/checklist')
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
            socket.on('card_add', async  (data) => {
               const newUser = await controller.newCard(data)
                io.emit('CARD_ADDED', newUser)
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