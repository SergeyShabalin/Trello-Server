const Router = require('express').Router;
const controller = require('../controllers/CardsController')
const CardsRouter = new Router();
//get post delete patch
CardsRouter.post('/', controller.newCard)
CardsRouter.delete('/:id', controller.deleteCard)
CardsRouter.patch('/title/:id', controller.updateCardTitle)
CardsRouter.patch('/descriptions/:id', controller.updateCardDescription)
CardsRouter.get('/:id', controller.getCardInfo)

module.exports = CardsRouter