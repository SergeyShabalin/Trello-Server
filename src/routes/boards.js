const Router = require('express').Router;
const controller = require('../controllers/BoardsController')
const BoardsRouter = new Router();
//get post delete patch
BoardsRouter.get('/:id', controller.getAllBoards)
BoardsRouter.post('/new', controller.newBoard)



module.exports = BoardsRouter