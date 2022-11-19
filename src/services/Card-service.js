const CardModel = require('../models/cards-model');
const ColumnsModel = require("../models/columns-model");


class CardService {

    async getOne(id) {
        const card = await CardModel.findOne({_id: id});
        return card;
    }

    async updateHeader(data, id) {
        const lastCard = await CardModel.findOne({_id: id})
        if (lastCard !== data) {
            await CardModel.updateOne({_id: id}, {header: data.header})
            console.log('header обновлен')
        } else console.log('Обновление не требуется')
    }


    async updateDescription(data, id) {
        const lastCard = await CardModel.findOne({_id: id})
        if (lastCard !== data) {
            await CardModel.updateOne({_id: id}, {description: data.description})
            console.log('description обновлен')
        } else console.log('Обновление не требуется')
    }

    async updateDecisionDate(data, id) {
        const lastCard = await CardModel.findOne({_id: id})
        if (lastCard !== data) {
            await CardModel.updateOne({_id: id}, {decisionDate: data.decisionDate})
            console.log('decisionDate обновлен')
        } else console.log('Обновление не требуется')
    }

    async dragDropCard(data, id) {
        const currentCard = await CardModel.findOne({_id: id})
        if (currentCard !== data) {
            await CardModel.updateOne({_id: id}, {column_id: data.targetColumnId})
            console.log('ColumnId у карточки обновлен')
        } else console.log('Обновление не требуется')
    }

    async dragDropCardToEmpty(data, id) {
        const currentCard = await CardModel.findOne({_id: id})
        if (currentCard !== data) {
            await CardModel.updateOne({_id: id}, {column_id: data.targetColumn})
            console.log('ColumnId у карточки обновлен')
        } else console.log('Обновление не требуется')
    }
}

module.exports = new CardService();