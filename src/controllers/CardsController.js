const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')

class CardsController {
    async getAllCards (req, res, next) {
        try {
            const cardData = await cardsModel.find({})
            console.log(cardData, cardsModel)
            return res.json(cardData)

        } catch (e) {
            next(e);
        }
    }

    async getOneCard(req, res, next) {
        try {
            const card = await CardService.getOne(req);
            console.log(card)
            return res.json(card);
        } catch (e) {
            next(e);
        }
    }


    async newCard (req, res, next) {
        try {
            const columnNew = new cardsModel(res)
            await columnNew.save()
            console.log(cardsModel)
            return res.json(columnNew)

        } catch (e) {
            next(e);
        }
    }

}


module.exports = new CardsController()