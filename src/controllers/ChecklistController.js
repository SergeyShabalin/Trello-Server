const checklistModel = require('../models/checklist-model')

class ChecklistController {
    async getAllChecklist (req, res, next) {
        try {
            const deviceData = await checklistModel.find({})
            return res.json(deviceData)

        } catch (e) {
            next(e);
        }
    }

    async newTask (req, res, next) {
        try {
            console.log(res)
            const taskNew = new checklistModel({task: 'написать план', done: false})
            await taskNew.save()
            return res.json(taskNew)

        } catch (e) {
            next(e);
        }
    }

}


module.exports = new ChecklistController()