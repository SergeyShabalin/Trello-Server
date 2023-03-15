const CardModel = require('../models/cards-model');
const cardsModel = require("../models/cards-model");
const columnsModel = require("../models/columns-model");
const checkListModel = require("../models/checklist-model");


class CardService {

    async addNew(data) {
        const cards = await cardsModel.find({})
        const order = cards.map(item => item.order)
        const maxOrder = (order.length < 1 ? 1 : order.reduce((a, b) => a > b ? a : b) + 1);
        const body = {...data, title: data.title, order: maxOrder, doneTask: 0, countTask: 0, decisionDate: null}
        if (data.title === '') {
            body.title = 'Новая карточка'
        }
        const cardNew = new cardsModel(body)
        await cardNew.save()
        const column = await columnsModel.findOne({_id: data.column_id})
        column.cards.push(cardNew._id)
        column.sortArr.push(maxOrder)
        await column.save()
        console.log('карта добавлена')
        return (cardNew)
    }

    async delete(id) {
        const card = await cardsModel.findOne({_id: id})
        const column = await columnsModel.findOne({_id: card.column_id})
        column.cards = column.cards.filter(item => item.toString() !== id.toString())
        column.sortArr = column.sortArr.filter(i => i !== card.order)
        await column.save()
        await checkListModel.remove({cardId: id})
        await cardsModel.deleteOne({_id: id})
    }

    async update(data, id) {
        const currentCard = await CardModel.findOne({_id: id})
        if (currentCard !== data) {
            await CardModel.updateOne({_id: data._id}, data)
            const changedCard = await CardModel.findOne({_id: data._id})
            console.log('карточка обновлена')
            return changedCard
        } else console.log('Обновление не требуется')
    }

    async dragDropCard(data, id) {
        const currentCard = await CardModel.findOne({_id: id})
        if (currentCard !== data) await CardModel.updateOne({_id: id}, {column_id: data.targetColumnId})
        currentCard.save()
        const currentColumn = await columnsModel.findOne({_id: data.currentColumnId})
        const targetColumn =  await columnsModel.findOne({_id: data.targetColumnId})
        const newCardsInCurrentColumn = currentColumn.cards.filter(id => id.toString() !== data.currentCardId.toString())
        const newArr = []

        if (targetColumn.cards.length === 0) {
            targetColumn.cards.push(data.currentCardId)
            targetColumn.save()
        } else {
            while (targetColumn.cards.length) {
                let cardId = targetColumn.cards.shift()
                if (cardId.toString() !== data.targetCardId.toString()) {
                    if(cardId.toString() === data.currentCardId.toString()) console.log('текущая карта')
                    else  newArr.push(cardId.toString())
                } else {
                    newArr.push(cardId.toString())
                    newArr.push(data.currentCardId.toString())
                }
            }
            targetColumn.cards = newArr
            targetColumn.save()
        }

      if(data.currentColumnId !== data.targetColumnId)  currentColumn.cards = newCardsInCurrentColumn
        currentColumn.save()
        return({status: 200})
    }
}

module.exports = new CardService();