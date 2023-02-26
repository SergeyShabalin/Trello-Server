const boardsModel = require('../models/boards-model')
const columnsModel = require("../models/columns-model");
const cardsModel = require("../models/cards-model");
const userModel = require("../models/user-model")

class BoardsController {

    async getAllBoards(req, res, next) {
        try {
             const boardData = await boardsModel.find({user_id: req.params.id})
             return res.json(boardData)
        } catch (e) {
            next(e);
        }
    }

    async getBoard(req, res, next) {
        try {
            const boardDataWithColumns = await boardsModel.findOne({_id: req.params.id}).populate('columns')
            const boardDataOnlyColumnIds = await boardsModel.findOne({_id: req.params.id})
            //TODO 1 сделать фильтрацию карточек по доске
            const cardData = await cardsModel.find({})
            const columnData = boardDataWithColumns.columns
            let obj = {}
            let columnObj = {}
            for (let i = 0; i < cardData.length; i++) {
                const card = cardData[i]
                obj = {
                    ...obj,
                    [card._id]: card
                }
            }

            for (let i = 0; i < columnData.length; i++) {
                const column = columnData[i]
                columnObj = {
                    ...columnObj,
                    [column._id]: column
                }
            }
            return res.json({currentBoard: boardDataOnlyColumnIds, allCards: obj, allColumns: columnObj})
        } catch (e) {
            res.json(e)
            next(e);
        }
    }

    async newBoard(req, res, next) {
        const body = {...req.body, title: req.body.payload.title, user_id:req.body.payload.userId, columns: [], background: req.body.payload.background}
        const currentUser = await userModel.findOne({_id: req.body.payload.userId})
        if (req.body.title === '') body.title = 'Новая доска'
         try {
            const boardNew = new boardsModel(body)
             currentUser.boardIds.push(boardNew._id)

             await currentUser.save()
             await boardNew.save()
             return res.json(boardNew)
        } catch (e) {
            next(e);
        }
    }

    async newBoardSample(req, res, next) {
        const body = {...req.body, title: req.body.title}
        if (req.body.title === '') body.title = 'Новая доска'
        try {
            const boardNew = new boardsModel(body)
            await boardNew.save()
            const samples = ['Предстоит сделать', 'В процессе', 'Готово']
            samples.map(item => {
                const body = {
                    title: item,
                    sortArr: [],
                    boardId: boardNew._id
                }
                const columnNew = new columnsModel(body)
                columnNew.save()
                boardNew.columns.push(columnNew._id)
            })
            await boardNew.save()
            return res.json(boardNew)
        } catch (e) {
            next(e);
        }
    }

    async updateBoard(req, res, next) {
        try {
            const currentBoard = await boardsModel.findOne({_id: req.params.id})
            const body = req.body
            if (req.body.title === currentBoard.title) {
                console.log('обновление не требуется')
                return res.json(currentBoard)
            } else {
                if (req.body.title === '') body.title = 'Новая доска'
                await boardsModel.updateOne({_id: req.params.id}, body)
                const newBoard = await boardsModel.findOne({_id: req.params.id})
                return res.json(newBoard)
            }
        } catch (e) {
            next(e);
        }
    }

}

module.exports = new BoardsController()