const CardModel = require("../models/cards-model");
const checklistModel = require("../models/checklist-model");


class ChecklistService {


    async updateTitle(data, id) {
        const lastTask = await checklistModel.findOne({_id: id})
        if (lastTask !== data ) {
            await checklistModel.updateOne({_id: id}, {task: data.task})
            console.log('Задача обновлена')
        } else console.log('Обновление не требуется')
    }

    async updateValue(data, id) {
        const lastTask = await checklistModel.findOne({_id: id})
        if (lastTask !== data ) {
            await checklistModel.updateOne({_id: id}, {done: data.done})
            console.log('Значение обновлено')
        } else console.log('Обновление не требуется')
    }
}

module.exports = new ChecklistService();