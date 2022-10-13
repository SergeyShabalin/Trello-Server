const Router = require('express').Router;
const controller = require('../controllers/ColumnsController')
const ColumnsRouter = new Router();
//get post delete patch
ColumnsRouter.get('/', controller.getAllColumns)
ColumnsRouter.post('/new', controller.newColumn)
ColumnsRouter.delete('/delete/:id', controller.deleteColumn)
ColumnsRouter.patch('/update/:id', controller.updateColumn)

module.exports = ColumnsRouter