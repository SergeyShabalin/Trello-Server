const Router = require('express').Router;
const controller = require('../controllers/ColumnsController')
const ColumnsRouter = new Router();
//get post delete patch
ColumnsRouter.get('/', controller.getAllColumns)
ColumnsRouter.post('/', controller.newColumn)
ColumnsRouter.delete('/:id', controller.deleteColumn)
ColumnsRouter.patch('/:id', controller.updateColumn)
ColumnsRouter.patch('/dragDrop/:id', controller.dragDropCardInColumn)

module.exports = ColumnsRouter