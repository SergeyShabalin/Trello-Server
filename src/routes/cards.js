const Router = require('express').Router;
const controller = require('../controllers/CardsController')
const CardsRouter = new Router();
//get post delete patch
CardsRouter.get('/', controller.getAllCards)
CardsRouter.post('/', controller.newCard)
CardsRouter.get('/:id', controller.getOneCard)
CardsRouter.delete('/:id', controller.deleteCard)

module.exports = CardsRouter