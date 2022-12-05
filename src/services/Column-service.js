const mongoose = require('mongoose');
const ColumnsModel = require('../models/columns-model');
const CardsModel = require('../models/cards-model')
const columnsModel = require("../models/columns-model");
const boardsModel = require("../models/boards-model");

class ColumnsService {

    async getAllColumns(id) {
        if (id) {
            const columnData = await columnsModel.find({}).populate('cards')
            const boardData = await boardsModel.find({_id: id})
            const currentColumns = boardData[0].columns.map(item => {
                return columnData.find(i => i._id.toString() === item.toString())
            })
            return  currentColumns
        } else
            return  []
    }

    async update(data, id) {
        const lastHeader = await ColumnsModel.findOne({_id: id})
        if (lastHeader.header !== data.header) {
            await ColumnsModel.updateOne({_id: id}, {header: data.header})
            console.log('успешно обновлено')
        } else console.log('Обновление не требуется')
    }

    async dragDrop(data, id) {
        const currentCard = mongoose.Types.ObjectId(data.currentCard._id);
        const targetColumn = await ColumnsModel.find({_id: data.targetColumnId})
        targetColumn.forEach(item => {
            const index = item.sortArr.indexOf(data.targetOrder) + 1
            item.sortArr.splice(index, 0, data.currentOrder)
            item.cards.push(currentCard)
            return item.sortArr
        })
        const newCardsInTargetColumn = targetColumn[0].cards
        const newSortArrInTargetColumn = targetColumn[0].sortArr
        await ColumnsModel.updateOne({_id: data.targetColumnId}, {
            cards: newCardsInTargetColumn,
            sortArr: newSortArrInTargetColumn
        })
        console.log('В целевую колонку добавлен id текущей карточки')

        const currentColumn = await ColumnsModel.find({_id: id})
        const newCards = currentColumn.map(item => {
            return item.cards.filter(i => i.toLocaleString() !== data.currentCard._id)
        })
        const newSortArr = currentColumn.map(card => {
            return card.sortArr.filter(i => i !== data.currentOrder)
        })
        await ColumnsModel.updateOne({_id: id}, {cards: newCards[0], sortArr: newSortArr[0]})
        console.log('Из текущей колонки удален id текущей карточки')
    }


    async dragDropInOneColumn(data, id) {
        const currentColumn = await ColumnsModel.find({_id: id})
        currentColumn.forEach(item => {
            const currentIndex = item.sortArr.indexOf(data.currentOrder)
            const targetIndex = item.sortArr.indexOf(data.targetOrder)
            item.sortArr.splice(currentIndex, 1)
            item.sortArr.splice(targetIndex, 0, data.currentOrder)
            return item.sortArr
        })
        await ColumnsModel.updateOne({_id: id}, {sortArr: currentColumn[0].sortArr})
    }

    async dragDropToEmptyColumn(data, id) {

        const cardCurrent = mongoose.Types.ObjectId(data.currentCardId);
        const targetColumn = await ColumnsModel.find({_id: data.targetColumnId})
        targetColumn.forEach(item => {
            // const index = item.sortArr.indexOf(data.targetOrder) + 1
            item.sortArr.splice(0, 0, data.currentOrder)
            item.cards.push(cardCurrent)
            return item.sortArr
        })
        const newCards = targetColumn[0].cards
        const newSortArr = targetColumn[0].sortArr
        await ColumnsModel.updateOne({_id: data.targetColumnId}, {
            cards: newCards,
            sortArr: newSortArr
        })
        console.log('В пустую колонку добавлен id текущей карточки')

        const columnCurrent  = await ColumnsModel.find({_id: id})
        const newCardsForCurrent = columnCurrent.map(item => {
            return item.cards.filter(i => i.toLocaleString() !== data.currentCardId)
        })
        const newSortArrForCurrent = columnCurrent.map(card => {
            return card.sortArr.filter(i => i !== data.currentOrder)
        })
        await ColumnsModel.updateOne({_id: id}, {cards: newCardsForCurrent[0], sortArr: newSortArrForCurrent[0]})
        console.log('Из текущей колонки удален id текущей карточки')
    }

}

module.exports = new ColumnsService();