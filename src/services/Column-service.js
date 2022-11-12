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

        console.log(data.currentOrder)
        console.log(data.targetOrder)

        const targetColumn = await ColumnsModel.find({_id: data.targetColumnId})

        targetColumn.forEach(item => {
            const index = item.sortArr.indexOf(data.targetOrder)+1
            item.sortArr.splice(index, 0, data.currentOrder)
            item.cards.push(currentCard)
            return item.sortArr
        })

        const newCardsInTargetColumn = targetColumn[0].cards
        const newSortArrInTargetColumn = targetColumn[0].sortArr
        console.log(newSortArrInTargetColumn)
        await ColumnsModel.updateOne({_id: data.targetColumnId}, {
            cards: newCardsInTargetColumn,
            sortArr: newSortArrInTargetColumn
        })

        //TODO МАссив работает, осталось удалить из текущего массива currentOrder
        console.log('В целевую колонку добавлен id текущей карточки')

        const currentCards = await ColumnsModel.find({_id: id})
        const b = currentCards.map(item => item.cards.filter(i => i.toLocaleString() !== data.currentCardId))
        await ColumnsModel.updateOne({_id: id}, {cards: b[0]})
        console.log('Из текущей колонки удален id текущей карточки')
    }

}

module.exports = new ColumnsService();