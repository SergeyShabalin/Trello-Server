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
            const body = req.body
            if (req.body.title === '') body.title = 'Новая карточка'
            const changedCard = await CardService.update(body, req.params.id)
            return res.json(changedCard)
        } catch (e) {
            next(e);
        }
    }

    async dragAndDropCard(req, res, next) {
        try {
            const status = await CardService.dragDropCard(req.body, req.params.id)
            console.log('В карточке изменен columnId')
            return res.json(status)
        } catch (e) {
            next(e);
        }
    }

    async getCardInfo(req, res, next) {
        try {
            const cardData = await cardsModel.findOne({_id: req.params.id}).populate('checkList')

            return res.json(cardData)
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new CardsController()