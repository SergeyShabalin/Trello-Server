const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')


class CardsController {


    async newCard(req, res) {
        try {
            const data = await CardService.addNew(req)
            return data
        } catch (e) {
            console.log(e);
        }
    }

    async deleteCard(cardId) {
        try {
           const boardId = await CardService.delete(cardId)
              return boardId
        } catch (e) {
            console.log(e);
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
            const boardId = await CardService.dragDropCard(req)
            console.log('В карточке изменен columnId')
            return boardId
        } catch (e) {
            console.log(e);
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