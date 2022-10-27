
const CardModel = require('../models/cards-model');
const ColumnsModel = require("../models/columns-model");


class CardService {

    async getOne(id) {
        const card = await CardModel.findOne({_id: id});
        return card;
    }

    async update(data, id) {
        const lastCard = await CardModel.findOne({_id: id})

        if (lastCard !== data ) {
            await CardModel.updateOne({_id: id}, {header: data.header, description: data.description})
            console.log('успешно обновлено')
        } else console.log('Обновление не требуется')
    }
}

module.exports = new CardService();