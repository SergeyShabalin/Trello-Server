const cardsModel = require('../models/cards-model')
const CardService = require('../services/Card-service')
const columnsModel = require("../models/columns-model");
const checkListModel = require("../models/checklist-model")
const CardModel = require("../models/cards-model");
const boardsModel = require("../models/boards-model");


class CardsController {

    async newCard(req, res, next) {
        try {
            const cards = await cardsModel.find({})
            const order = cards.map(item => item.order)
                //TODO сделать поле у колонки, в который буду записывать максимальный
                // TODO ордер, чтобы каждый раз редьюсом не гонять, а просто прибавлять к нему единицу
            const maxOrder = (order.length < 1 ? 1 : order.reduce((a, b) => a > b ? a : b) + 1);
            const body = {...req.body, header: req.body.header, order: maxOrder}
            if (req.body.header === '') {body.header = 'Новая карточка'}
            const cardNew = new cardsModel(body)
            await cardNew.save()
            const column = await columnsModel.findOne({_id: req.body.column_id})
            column.cards.push(cardNew._id)
            column.sortArr.push(maxOrder)
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
            column.sortArr = column.sortArr.filter(i=>i !== card.order)

            await column.save()
            await checkListModel.remove({cardId: req.params.id})
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
        try {
            const Card = await CardService.updateDecisionDate(req.body, req.params.id)
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