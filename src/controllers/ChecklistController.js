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
            const body = {...req, done: false}
            const checkListNew = new checklistModel(body)
            await checkListNew.save()
            const card = await cardsModel.findOne({_id: req.cardId})
            card.countTask = card.countTask + 1
            card.checkList.push(checkListNew._id)
            const currentColumn = await columnsModel.findOne({_id: card.column_id})

            await card.save()
            console.log('Задача добавлена')
            const data={
                task: checkListNew,
                boardId: currentColumn.boardId,
                card
            }
            return  data
        } catch (e) {
            console.log(e);
        }
    }


    async deleteTask(req, res, next) {
        try {
            const task = await checklistModel.findOne({_id: req.params.checkListId})
            const card = await cardsModel.findOne({_id: task.cardId})
            card.countTask = card.countTask - 1
            const checklistAfterDelete = card.checkList.filter(item => item.toString() !== req.params.checkListId.toString())
            card.checkList = checklistAfterDelete
            await checklistModel.deleteOne({_id: req.params.checkListId})
            await card.save()
            console.log('задача удалена')
            return res.json(card)

        } catch (e) {
            next(e);
        }
    }

    async updateTask(req, res, next) {
        try {
            const task = await ChecklistService.updateTask(req.body, req.params.id)
            const card = await cardsModel.findOne({_id: req.body.cardId})
            if(!req.body.task){
            if(req.body.done === true){
                card.doneTask =  card.doneTask +1
            } else card.doneTask =  card.doneTask -1}
            await card.save()
            const data = {
                task,
                card
            }
            return res.json(data)
        } catch (e) {
            next(e);
        }
    }

    async updateTaskValue(req, res, next) {
        try {
             const taskValue = await ChecklistService.updateValue(req.body, req.params.id)
             const card = await cardsModel.findOne({_id: req.body.cardId})
            if(req.body.done === true){
                card.doneTask =  card.doneTask +1
            } else card.doneTask =  card.doneTask -1
            await card.save()
             return res.json(taskValue)
        } catch (e) {
            next(e);
        }
    }

}


module.exports = new ChecklistController()