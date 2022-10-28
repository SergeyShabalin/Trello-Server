const Router = require('express').Router;
const controller = require('../controllers/ChecklistController')
const ChecklistRouter = new Router();
//get post delete patch
ChecklistRouter.get('/', controller.getAllChecklist)
ChecklistRouter.post('/', controller.newTask)
ChecklistRouter.delete('/:cardId/:checkListId', controller.deleteTask)

module.exports = ChecklistRouter