
const CardModel = require('../models/cards-model');


class CardService {

    async getOne(id) {
        const card = await CardModel.findOne({_id: id});
        return card;
    }
}

module.exports = new CardService();