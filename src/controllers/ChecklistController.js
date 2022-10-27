const checklistModel = require('../models/checklist-model')
const cardsModel = require("../models/cards-model");
const columnsModel = require("../models/columns-model");

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

    // async newTask (req, res, next) {
    //     try {
    //         console.log(res)
    //         const taskNew = new checklistModel({task: 'написать план', done: false})
    //         await taskNew.save()
    //         return res.json(taskNew)
    //
    //     } catch (e) {
    //         next(e);
    //     }
    // }

}


module.exports = new ChecklistController()