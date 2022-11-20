const boardsModel = require('../models/boards-model')
const columnsModel = require("../models/columns-model");

class BoardsController {
    async getAllBoards(req, res, next) {
        try {
            const boardData = await boardsModel.find({})
            console.log(boardData)
            return res.json(boardData)

        } catch (e) {
            next(e);
        }
    }

    async newBoard(req, res, next) {
        try {
            const columnNew = new boardsModel({title: 'доска 1'})
            await columnNew.save()
            console.log(boardsModel)
            return res.json(columnNew)

        } catch (e) {
            next(e);
        }
    }

    async addNewColumn(req, res, next) {
        try {
            const currentBoard = await boardsModel.findOne({_id: req.params.id})
            const currentColumn = await columnsModel.findOne({boardId: req.params.id})
             currentBoard.columns.push(currentColumn._id)
            await currentBoard.save()
             return res.json(currentBoard)
        } catch (e) {
            next(e);
        }
    }


}

module.exports = new BoardsController()