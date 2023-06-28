const mongoose = require('mongoose');
const columnsModel = require('../models/columns-model')
const cardsModel = require('../models/cards-model')
const cardsController = require('../controllers/CardsController')
const columnService = require('../services/Column-service')
const checkListModel = require("../models/checklist-model");
const ColumnsModel = require("../models/columns-model");
const boardsModel = require("../models/boards-model");

class ColumnsController {
    async getAllColumns(req, res, next) {
        try {
            const allColumns = await columnService.getAllColumns(req.params.id)
            return res.json(allColumns)
        } catch (e) {
            next(e);
        }
    }

    async newColumn(req, res) {
        const body = {
            title: req.body.title,
            boardId: req.body.boardId
        }
        if (req.body.title === '') {
            body.title = 'Новая колонка'
        }
        try {
            const columnNew = new columnsModel(body)
            await columnNew.save()
            const currentBoard = await boardsModel.findOne({_id: req.body.boardId})
            currentBoard.columns.push(columnNew._id)
            await currentBoard.save()
            return res.json(columnNew)
        } catch (e) {
            console.log(e)
        }
    }

    async deleteColumn(req, res) {
        const columnId = req.params.id.toString()
        try {
            const cardsInColumn = await cardsModel.find({column_id: columnId})
            const cardsId = cardsInColumn.map(i => i._id)
            await checkListModel.deleteMany({cardId: cardsId})
            const isDeleteCardsInColumn = await cardsModel.deleteMany({column_id: columnId})

            const currentColumn = await columnsModel.findOne({_id: columnId})
            const currentBoard = await boardsModel.findOne({_id: currentColumn.boardId})
            currentBoard.columns = currentBoard.columns.filter(item => item.toString() !== currentColumn._id.toString())

            const isDelete = await columnsModel.deleteOne({_id: columnId})
            await currentBoard.save()

            if (isDelete && isDeleteCardsInColumn) return res.json(columnId)
            else console.log('the error deleted')
        } catch (e) {
            console.log(e)
        }
    }

    async updateColumn(req, res) {
        try {
            if (req.body.title === '') req.body.title = 'Новая колонка'
            const refreshColumn = await columnService.update(req.body)
            return res.json(refreshColumn)
        } catch (e) {
            console.log(e);
        }
    }

    async dragDropCardInColumn(req, res) {
        try {
            const refreshColumn = await columnService.dragDrop(req.body.data, req.params.id)
            console.log('Карточка перемещена в другую колнку')
            return res.json(refreshColumn)
        } catch (e) {
            console.log(e);
        }
    }

    async dragDropCardInOneColumn(req, res, next) {
        try {
            const refreshColumn = await columnService.dragDropInOneColumn(req.body.data, req.params.id)
            console.log('Карточка перемещена в пределах колнки')
            return res.json(refreshColumn)
        } catch (e) {
            next(e);
        }
    }

    async dragDropCardToEmpty(req, res, next) {
        try {
            const refreshColumn = await columnService.dragDropToEmptyColumn(req.body, req.params.id)
            console.log('Карточка перемещена в пустую колонку')
            return res.json(refreshColumn)
        } catch (e) {
            next(e);
        }
    }

    async dragDropColumn(data) {
        try {
            const currentColumn = await columnsModel.findOne({_id: data.currentColumnId})
            const currentBoard = await boardsModel.findOne({_id: currentColumn.boardId})
            const allColumns = currentBoard.columns
            const currentColumnIndex = allColumns.indexOf(data.currentColumnId)
            const targetColumnIndex = allColumns.indexOf(data.targetColumnId)
            allColumns.splice(currentColumnIndex, 1)
            allColumns.splice(targetColumnIndex, 0, data.currentColumnId)
            currentBoard.columns = allColumns
            currentBoard.save()
            return currentBoard
        } catch (e) {
            console.log(e)
        }
    }

}

module.exports = new ColumnsController()