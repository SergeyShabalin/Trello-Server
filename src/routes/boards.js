const Router = require('express').Router;
const controller = require('../controllers/BoardsController')
const BoardsRouter = new Router();
//get post delete patch
BoardsRouter.get('/', controller.getAllBoards)
BoardsRouter.post('/new', controller.newBoard)
BoardsRouter.patch('/addNewColumn/:id', controller.addNewColumn)


module.exports = BoardsRouter