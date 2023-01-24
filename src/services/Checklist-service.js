const checklistModel = require("../models/checklist-model");


class ChecklistService {

    async updateTask(data, id) {
        const lastTask = await checklistModel.findOne({_id: id})
        if (lastTask !== data) {
            await checklistModel.updateOne({_id: id}, {task: data.task, done: data.done})
            const newTask = await checklistModel.findOne({_id: id})
            console.log('Задача обновлена')
            return newTask
        } else console.log('Обновление не требуется')
    }

}

module.exports = new ChecklistService();