const Router = require('express').Router;
const controller = require('../controllers/ChecklistController')
const ChecklistRouter = new Router();

ChecklistRouter.get('/', controller.getAllChecklist)
ChecklistRouter.post('/', controller.newTask)
ChecklistRouter.delete('/:cardId/:checkListId', controller.deleteTask)
ChecklistRouter.patch('/:id', controller.updateTask)
ChecklistRouter.patch('/value/:id', controller.updateTaskValue)

module.exports = ChecklistRouter