const Router = require('express').Router;
const UserController = require('../controllers/UserController')
const UserRouter = new Router();
const authMiddleware = require('../middleware/authMiddleware')

UserRouter.post('/registration',UserController.registration )
UserRouter.post('/login',UserController.login )
UserRouter.get('/checkLogin', authMiddleware, UserController.checkLogin )
UserRouter.delete('/logout',UserController.logout )
UserRouter.post('/shareBoard',UserController.shareBoard )

module.exports = UserRouter