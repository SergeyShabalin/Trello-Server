const boardsModel = require('../models/boards-model')
const columnsModel = require("../models/columns-model");
const cardsModel = require("../models/cards-model");
const userModel = require("../models/user-model")
const UserModel = require("../models/user-model");

class BoardsController {

    async getAllBoards(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({_id: req.params.id})
            let boards = []
            for (let i = 0; i < currentUser.boardIds.length; i++) {
                const board = currentUser.boardIds[i]
                const targetBoard = await boardsModel.findOne({_id: board._id})
                boards.push(targetBoard)
            }
            return res.json(boards)
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
        const currentUser = await userModel.findOne({_id: req.body.payload.userId})
        const body = {
            ...req.body,
            title: req.body.payload.title,
            user_ids: [req.body.payload.userId],
            columns: [],
            background: req.body.payload.background
        }

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

    async updateBoard(req, res) {
        try {
            console.log(req.body)
            const currentBoard = await boardsModel.findOne({_id: req.body._id})
            if (req.body.title === currentBoard.title) {
                console.log('обновление не требуется')
                return res.json(currentBoard)
            } else {
                if (req.body.title === '') req.body.title = 'Новая доска'
                await boardsModel.updateOne({_id: req.body._id}, req.body)
                const newBoard = await boardsModel.findOne({_id: req.body._id})
                console.log(newBoard)
                return res.json(newBoard)
            }
        } catch (e) {
            console.log(e);
        }
    }

}

module.exports = new BoardsController()