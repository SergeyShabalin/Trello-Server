const columnsModel = require('../models/columns-model')
const cardsModel = require('../models/cards-model')
const columnService = require('../services/Column-service')
const checkListModel = require("../models/checklist-model");

class ColumnsController {
    async getAllColumns(req, res, next) {
        try {
            const columnData = await columnsModel.find({}).populate('cards')
            const cardData = await cardsModel.find({}).populate('checkList')

            const doneTasks = cardData.map(i => {
                return i.checkList.filter(i => i.done).length
            })

            const allTasks = cardData.map(i => {
                return i.checkList.length
            })

            const data = {columnData, doneTasks, allTasks}
            return res.json(data)
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

        //TODO сделать удаление чеклистов во всех карточках в этой колонке
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
}

module.exports = new ColumnsController()