const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')
const columnsModel = require("../models/columns-model");
const checkListModel = require("../models/checklist-model")


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
            await checkListModel.remove({cardId: req.params.id })
            await cardsModel.deleteOne({_id: req.params.id})
        } catch (e) {
            next(e);
        }
    }

    async updateCardTitle(req, res, next) {
        try {
            const Card = await CardService.updateHeader(req.body, req.params.id)
            return res.json(Card)
        } catch (e) {
            next(e);
        }
    }

    async updateCardDescription(req, res, next) {
        try {
            const Card = await CardService.updateDescription(req.body, req.params.id)
            return res.json(Card)
        } catch (e) {
            next(e);
        }
    }

    async updateCardDecisionDate(req, res, next) {
        console.log(req.params.id)
        try {
            const Card = await CardService.updateDecisionDate(req.body, req.params.id)
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