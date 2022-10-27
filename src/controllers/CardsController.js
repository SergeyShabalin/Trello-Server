const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')
const columnsModel = require("../models/columns-model");


class CardsController {

    async newCard(req, res, next) {
        try {
            const cardNew = new cardsModel(req.body)
            await cardNew.save()
            const column = await columnsModel.findOne({_id: req.body.column_id})
            column.cards.push(cardNew._id)
            await column.save()
            return res.json(cardNew)

        } catch (e) {
            next(e);
        }
    }

    async deleteCard(req, res, next) {

        try {
            const card = await cardsModel.findOne({_id: req.params.id})
            const column = await columnsModel.findOne({_id: card.column_id})
            column.cards = column.cards.filter(item => item.toString() !== req.params.id.toString())
            await column.save()
            await cardsModel.deleteOne({_id: req.params.id})
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

    async getCardInfo (req, res, next) {
        try {
            const cardData = await cardsModel.findOne({_id: req.params.id}).populate('checkList')
            return res.json(cardData)
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new CardsController()