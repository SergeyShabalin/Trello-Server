const boardsModel = require('../models/boards-model')
const columnsModel = require("../models/columns-model");

class BoardsController {
    async getAllBoards(req, res, next) {
        try {
            const boardData = await boardsModel.find({_id: req.params.id})
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

}

module.exports = new BoardsController()