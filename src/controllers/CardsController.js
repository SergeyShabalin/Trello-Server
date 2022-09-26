const cardsModel = require('../models/cards-model')

class CardsController {
    async getAllCards (req, res, next) {
        try {
            const deviceData = await cardsModel.find({})
            console.log(deviceData, cardsModel)
            return res.json(deviceData)

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