const Router = require('express').Router;
const controller = require('../controllers/ChecklistController')
const ChecklistRouter = new Router();
//get post delete patch
ChecklistRouter.get('/', controller.getAllChecklist)
ChecklistRouter.post('/', controller.newTask)
ChecklistRouter.delete('/:cardId/:checkListId', controller.deleteTask)
ChecklistRouter.patch('/title/:id', controller.updateTaskTitle)
ChecklistRouter.patch('/value/:id', controller.updateTaskValue)

module.exports = ChecklistRouter