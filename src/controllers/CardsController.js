const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')
const columnsModel = require("../models/columns-model");

class CardsController {
    async getAllCards(req, res, next) {
        try {
            const cardData = await cardsModel.find({})
            return res.json(cardData)

        } catch (e) {
            next(e);
        }
    }

    async getOneCard(req, res, next) {
        try {
            const card = await CardService.getOne(req.params.id);
            return res.json(card);
        } catch (e) {
            next(e);
        }
    }


    async newCard(req, res, next) {
        console.log('приходящий тайтл', req.body)
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
            const columnId = card.column_id
            const column = await columnsModel.findOne({_id: columnId})
            let myIndex = column.cards.indexOf(req.params.id);
            column.cards.splice(myIndex, 1)
            await column.save()
            await cardsModel.deleteOne({_id: req.params.id})
        } catch (e) {
            next(e);
        }

    }
}


module.exports = new CardsController()