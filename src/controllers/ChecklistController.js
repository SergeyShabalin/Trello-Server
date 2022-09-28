const checklistModel = require('../models/checklist-model')

class ChecklistController {
    async getAllChecklist (req, res, next) {
        try {
            const deviceData = await checklistModel.find({})
            console.log(deviceData, checklistModel)
            return res.json(deviceData)

        } catch (e) {
            next(e);
        }
    }

    async newTask (req, res, next) {
        try {
            const columnNew = new checklistModel({task: 'написать план', done: false})
            await columnNew.save()
            console.log(checklistModel)
            return res.json(columnNew)

        } catch (e) {
            next(e);
        }
    }

}


module.exports = new ChecklistController()