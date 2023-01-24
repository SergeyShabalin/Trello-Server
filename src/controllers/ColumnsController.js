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

    async newColumn(req, res, next) {
        const body = {
            title: req.body.title,
            sortArr: [],
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
            //TODO проверку на добавление новой колонки
            return res.json(columnNew)
        } catch (e) {
            next(e);
        }
    }

    async deleteColumn(req, res, next) {
        try {
            const cardsInColumn = await cardsModel.find({column_id: req.params.id})
            const cardsId = cardsInColumn.map(i => i._id)
            await checkListModel.remove({cardId: cardsId})
            const isDeleteCardsInColumn = await cardsModel.remove({column_id: req.params.id})

            const currentColumn = await columnsModel.findOne({_id: req.params.id})
            const currentBoard = await boardsModel.findOne({_id: currentColumn.boardId})
            currentBoard.columns = currentBoard.columns.filter(item => item.toString() !== currentColumn._id.toString())

            const isDelete = await columnsModel.remove({_id: req.params.id})
            await currentBoard.save()
            if (isDelete && isDeleteCardsInColumn) res.send('column deleted')
            else res.send('the error deleted')
        } catch (e) {
            next(e);
        }
    }

    async updateColumn(req, res, next) {
        try {
            const refreshColumn = await columnService.update(req.body, req.params.id)
            console.log(refreshColumn)
            return res.json(refreshColumn)
        } catch (e) {
            next(e);
        }
    }

    async dragDropCardInColumn(req, res, next) {
        try {
            const refreshColumn = await columnService.dragDrop(req.body.data, req.params.id)
            console.log('Карточка перемещена в другую колнку')
            return res.json(refreshColumn)
        } catch (e) {
            next(e);
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

}

module.exports = new ColumnsController()