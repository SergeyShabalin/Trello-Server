const CardModel = require('../models/cards-model');
const cardsModel = require("../models/cards-model");
const columnsModel = require("../models/columns-model");
const checkListModel = require("../models/checklist-model");


class CardService {

    async addNew(data) {
        const cards = await cardsModel.find({})
        const order = cards.map(item => item.order)
        const maxOrder = (order.length < 1 ? 1 : order.reduce((a, b) => a > b ? a : b) + 1);
        const body = {...data, title: data.title, order: maxOrder, doneTask: 0, countTask: 0, decisionDate: null, memberIds: []}
        if (data.title === '') {
            body.title = 'Новая карточка'
        }
        const cardNew = new cardsModel(body)
        await cardNew.save()
        const column = await columnsModel.findOne({_id: data.column_id})
        column.cards.push(cardNew._id)
        column.sortArr.push(maxOrder)
        const dataCard = {
            boardId: column.boardId,
            cardNew
        }
        await column.save()
        return (dataCard)
    }

    async delete(id) {
        const card = await cardsModel.findOne({_id: id})
        const column = await columnsModel.findOne({_id: card.column_id})
        const boardId = column.boardId
        column.cards = column.cards.filter(item => item.toString() !== id.toString())
        column.sortArr = column.sortArr.filter(i => i !== card.order)
        await column.save()
        await checkListModel.remove({cardId: id})
        await cardsModel.deleteOne({_id: id})
        return boardId
    }

    async update(data, id) {
        const currentCard = await CardModel.findOne({_id: id})
        if (currentCard !== data) {
            await CardModel.updateOne({_id: data._id}, data)
            const changedCard = await CardModel.findOne({_id: data._id})
            const currentColumnId =  changedCard.column_id.toString()
            const currentColumn = await columnsModel.findOne({_id: currentColumnId})
            const currentBoardId = currentColumn.boardId.toString()
            await changedCard.save()

            const card = {
                changedCard,
                boardId: currentBoardId
            }
            return card
        } else console.log('Обновление не требуется')
    }

    async dragDropCard(data) {
        const {currentColumnId, currentCardId, targetColumnId, targetCardId} = data
        const currentCard = await CardModel.findOne({_id: currentCardId})
        if (currentCard !== data) await CardModel.updateOne({_id: currentCardId}, {column_id: targetColumnId})
        currentCard.save()
        const currentColumn = await columnsModel.findOne({_id: currentColumnId})
        const targetColumn = await columnsModel.findOne({_id: targetColumnId})
        const newCardsInCurrentColumn = currentColumn.cards.filter(id => id.toString() !== currentCardId.toString())
        const newArr = []
        const boardId = targetColumn.boardId

        if (targetColumn.cards.length === 0) {
            targetColumn.cards.push(currentCardId)
            targetColumn.save()
        } else {
            while (targetColumn.cards.length) {
                let cardId = targetColumn.cards.shift()
                if (cardId.toString() !== targetCardId.toString()) {
                    if (cardId.toString() === currentCardId.toString()) console.log('текущая карта')
                    else newArr.push(cardId.toString())
                } else {
                    newArr.push(cardId.toString())
                    newArr.push(currentCardId.toString())
                }
            }
            targetColumn.cards = newArr
            targetColumn.save()
        }

        if (currentColumnId !== targetColumnId) currentColumn.cards = newCardsInCurrentColumn
        currentColumn.save()
        return boardId
    }
}

module.exports = new CardService();