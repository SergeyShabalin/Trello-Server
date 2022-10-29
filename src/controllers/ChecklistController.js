const checklistModel = require('../models/checklist-model')
const cardsModel = require("../models/cards-model");
const columnsModel = require("../models/columns-model");
const CardService = require("../services/Card-service");
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
            const checkListNew = new checklistModel(req.body)
            await checkListNew.save()
            const card = await cardsModel.findOne({_id: req.body.cardId})
            card.checkList.push(checkListNew._id)
            await card.save()
            console.log('Задача добавлена')
            return res.json(checkListNew)
        } catch (e) {
            next(e);
        }
    }


    async deleteTask(req, res, next) {
        try {
            const task = await checklistModel.findOne({_id: req.params.checkListId})
            const card = await cardsModel.findOne({_id: task.cardId})
            const checklistAfterDelete = card.checkList.filter(item => item.toString() !== req.params.checkListId.toString())
            card.checkList = checklistAfterDelete
            await checklistModel.deleteOne({_id: req.params.checkListId})
            await card.save()
            console.log('задача удалена')
        } catch (e) {
            next(e);
        }
    }

    async updateTaskTitle(req, res, next) {
        try {
            const taskTitle = await ChecklistService.updateTitle(req.body, req.params.id)
            return res.json(taskTitle)
        } catch (e) {
            next(e);
        }
    }

    async updateTaskValue(req, res, next) {
        try {
            const taskValue = await ChecklistService.updateValue(req.body, req.params.id)
            return res.json(taskValue)
        } catch (e) {
            next(e);
        }
    }

}


module.exports = new ChecklistController()