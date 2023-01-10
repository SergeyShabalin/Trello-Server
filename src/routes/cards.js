const Router = require('express').Router;
const controller = require('../controllers/CardsController')
const CardsRouter = new Router();

CardsRouter.post('/', controller.newCard)
CardsRouter.delete('/:id', controller.deleteCard)
CardsRouter.patch('/update/:id', controller.updateCard)
CardsRouter.patch('/dragDrop/:id', controller.dragAndDropCard)
CardsRouter.get('/:id', controller.getCardInfo)

module.exports = CardsRouter