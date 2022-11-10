const mongoose = require('mongoose');
const ColumnsModel = require('../models/columns-model');
const CardsModel = require('../models/cards-model')

class ColumnsService {

    async update(data, id) {
        const lastHeader = await ColumnsModel.findOne({_id: id})
        if (lastHeader.header !== data.header) {
            await ColumnsModel.updateOne({_id: id}, {header: data.header})
            console.log('успешно обновлено')
        } else console.log('Обновление не требуется')
    }

    async dragDrop(data, id) {
        const currentCard = mongoose.Types.ObjectId(data.currentCardId);
        const targetCards = await ColumnsModel.find({_id: data.targetColumnId})
        targetCards.forEach(item => item.cards.push(currentCard))
        const newCardsInTargetColumn = targetCards[0].cards
        await ColumnsModel.updateOne({_id: data.targetColumnId}, {cards: newCardsInTargetColumn})
        console.log('В целевую колонку добавлен id текущей карточки')

        const currentCards = await ColumnsModel.find({_id: id})
        const b = currentCards.map(item => item.cards.filter(i => i.toLocaleString() !== data.currentCardId))
        await ColumnsModel.updateOne({_id: id}, {cards: b[0]})
        console.log('Из текущей колонки удален id текущей карточки')
    }

}

module.exports = new ColumnsService();