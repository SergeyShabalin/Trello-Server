const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')
const columnsModel = require("../models/columns-model");
const checkListModel = require("../models/checklist-model")
const CardModel = require("../models/cards-model");
const boardsModel = require("../models/boards-model");


class CardsController {

    async newCard(req, res, next) {
        try {
            const newCard = await CardService.addNew(req.body)
            return res.json(newCard)
        } catch (e) {
            next(e);
        }
    }

    async deleteCard(req, res, next) {
        try {
            await CardService.delete(req.params.id)
            return res.json({status: 200})
        } catch (e) {
            next(e);
        }
    }

    async updateCard(req, res, next) {
        try {
            const Card = await CardService.update(req.body, req.params.id)
            return res.json(Card)
        } catch (e) {
            next(e);
        }
    }

    async dragAndDropCard(req, res, next) {
        try {
            console.log('В карточке изменен columnId')
            const Card = await CardService.dragDropCard(req.body, req.params.id)
            return res.json(Card)
        } catch (e) {
            next(e);
        }
    }

    async getCardInfo(req, res, next) {
        try {
            const cardData = await cardsModel.findOne({_id: req.params.id}).populate('checkList')
            const column = await columnsModel.findOne({_id: cardData.column_id})

            const data = {
                _id: cardData._id,
                header: cardData.header,
                description: cardData.description,
                column_id: cardData.column_id,
                checkList: cardData.checkList,
                decisionDate: cardData.decisionDate,
                columnHeader: column.header
            }
            return res.json(data)
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new CardsController()