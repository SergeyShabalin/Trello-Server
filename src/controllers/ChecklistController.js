const checklistModel = require('../models/checklist-model')
const cardsModel = require("../models/cards-model");
const columnsModel = require("../models/columns-model");
const ChecklistService = require("../services/Checklist-service")

class ChecklistController {
    async getAllChecklist(req, res, next) {
        try {
            const deviceData = await checklistModel.find({})
            return res.json(deviceData)
        } catch (e) {
            next(e);
        }
    }

    async newTask(req, res, next) {
        try {
            const body = {...req, done: false}
            const checkListNew = new checklistModel(body)
            await checkListNew.save()
            const card = await cardsModel.findOne({_id: req.cardId})
            card.countTask = card.countTask + 1
            card.checkList.push(checkListNew._id)
            const currentColumn = await columnsModel.findOne({_id: card.column_id})
            await card.save()
            console.log('Задача добавлена')
            const data = {
                task: checkListNew,
                boardId: currentColumn.boardId,
                card
            }
            return data
        } catch (e) {
            console.log(e);
        }
    }


    async deleteTask(req, res, next) {
        try {
            const task = await checklistModel.findOne({_id: req.taskId})
            const card = await cardsModel.findOne({_id: task.cardId})
            card.countTask = card.countTask - 1
            const checklistAfterDelete = card.checkList.filter(item => item.toString() !== req.taskId.toString())
            card.checkList = checklistAfterDelete
            const currentColumn = await columnsModel.findOne({_id: card.column_id})
            const boardId = currentColumn.boardId.toString()
            await checklistModel.deleteOne({_id: req.taskId})
            await card.save()
            console.log('задача удалена')
            return {card, boardId, taskId: req.taskId}

        } catch (e) {
            console.log(e);
        }
    }

    async updateTask(req, res, next) {
        try {
            const task = await ChecklistService.updateTask(req, req._id)
            const card = await cardsModel.findOne({_id: req.cardId})
            const currentColumn = await columnsModel.findOne({_id: card.column_id})
            const boardId = currentColumn.boardId.toString()
            if (!req.task) {
                if (req.done === true) {
                    card.doneTask = card.doneTask + 1
                } else card.doneTask = card.doneTask - 1
            }
            await card.save()
            const data = {
                task,
                card,
                boardId
            }
            console.log(data)
            return data
        } catch (e) {
            console.log(e);
        }
    }

    async updateTaskValue(req, res, next) {
        try {
            const taskValue = await ChecklistService.updateValue(req.body, req.params.id)
            const card = await cardsModel.findOne({_id: req.body.cardId})
            if (req.body.done === true) {
                card.doneTask = card.doneTask + 1
            } else card.doneTask = card.doneTask - 1
            await card.save()
            return res.json(taskValue)
        } catch (e) {
            next(e);
        }
    }




}


module.exports = new ChecklistController()