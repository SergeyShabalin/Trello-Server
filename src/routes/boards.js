const Router = require('express').Router;
const controller = require('../controllers/BoardsController')
const BoardsRouter = new Router();
//get post delete patch
BoardsRouter.get('/', controller.getAllBoards)
BoardsRouter.get('/:id', controller.getBoard)
BoardsRouter.post('/', controller.newBoard)
BoardsRouter.patch('/:id', controller.updateBoard)


module.exports = BoardsRouter