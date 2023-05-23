const cardsModel = require('../models/cards-model')
const userModel = require('../models/user-model')
const columnModel = require('../models/columns-model')
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

    async updateCard(data, res, next) {
        try {

            if (data.title === '') data.title = 'Новая карточка'
            const changedCard = await CardService.update(data, data._id)
            return  changedCard
        } catch (e) {
            console.log(e);
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

    async getMembersOneCard(data){
        try{
            const currentCard = await cardsModel.findOne({ _id: data.cardId });
            const currentColumn = await columnModel.findOne({ _id: currentCard.column_id.toString() });
            console.log(currentColumn.boardId);
            const userList = await userModel.find({});
            const userMap = {};

            for (let i = 0; i < userList.length; i++) {
                const user = userList[i];
                userMap[user._id.toString()] = {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    secondName: user.secondName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                };
            }


            const resultArray = [];

            for (let i = 0; i < currentCard.members.length; i++) {
                const memberId = currentCard.members[i].toString();
                if (userMap.hasOwnProperty(memberId)) {
                    resultArray.push(userMap[memberId]);
                }
            }

           return({users: resultArray, boardId: currentColumn.boardId})
        } catch (e){

        }
    }
}


module.exports = new CardsController()