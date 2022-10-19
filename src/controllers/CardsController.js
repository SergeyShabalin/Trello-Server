const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')
const columnsModel = require("../models/columns-model");

class CardsController {
    async getAllCards (req, res, next) {
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


    async newCard (req, res, next) {
        console.log('body',req.body)
        try {
            const cardNew = new cardsModel(req.body)
            await cardNew.save()

            const column = await columnsModel.findOne({_id: req.body.columnId})
            column.cards.push(cardNew._id)

            await column.save()

            return res.json(cardNew)

        } catch (e) {
            next(e);
        }
    }


}


module.exports = new CardsController()