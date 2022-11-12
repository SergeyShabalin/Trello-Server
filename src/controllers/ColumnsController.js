const columnsModel = require('../models/columns-model')
const cardsModel = require('../models/cards-model')
const columnService = require('../services/Column-service')
const checkListModel = require("../models/checklist-model");
const ColumnsModel = require("../models/columns-model");

class ColumnsController {
    async getAllColumns(req, res, next) {
        try {
            //TODO загуглить как доставать поля из Populate достать хэдер, дату и 2 новых добавленных поля
            const columnData = await columnsModel.find({}).populate('cards')
            // const cardData = await cardsModel.find({}).populate('checkList')
            // const colId = columnData.map(i=>{
            //     return [...columnData, i.cards = cardData]
            // })

             return res.json(columnData)
        } catch (e) {
            next(e);
        }
    }

    async newColumn(req, res, next) {
        console.log(req.body)
        try {
            const columnNew = new columnsModel(req.body)
            await columnNew.save()
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
            const isDelete = await columnsModel.remove({_id: req.params.id})
            if (isDelete && isDeleteCardsInColumn) res.send('column deleted')
            else res.send('the error deleted')
        } catch (e) {
            next(e);
        }
    }

    async updateColumn(req, res, next) {
        try {
            const refreshColumn = await columnService.update(req.body, req.params.id)
            return res.json(refreshColumn)
        } catch (e) {
            next(e);
        }
    }

    async dragDropCardInColumn(req, res, next) {

        try {
            if(req.body.targetColumnId ===req.params.id ){
                console.log('Карточка перемещена в пределах колнки')
            } else {
            const refreshColumn = await columnService.dragDrop(req.body, req.params.id)
            return res.json(refreshColumn) }
        } catch (e) {
            next(e);
        }
    }

}

module.exports = new ColumnsController()