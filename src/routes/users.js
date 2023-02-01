const Router = require('express').Router;
const UserController = require('../controllers/UserController')
const UserRouter = new Router();

UserRouter.post('/registration',UserController.registration )
UserRouter.post('/login',UserController.login )
UserRouter.post('/checklogin/:id',UserController.checkLogin )
UserRouter.delete('/logout',UserController.logout )

module.exports = UserRouter