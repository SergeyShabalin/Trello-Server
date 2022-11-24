const boardsModel = require('../models/boards-model')
const columnsModel = require("../models/columns-model");
const ColumnsModel = require("../models/columns-model");

class BoardsController {

    async getAllBoards(req, res, next) {
        try {
            const boardData = await boardsModel.find({})
            return res.json(boardData)
        } catch (e) {
            next(e);
        }
    }

    async getBoard(req, res, next) {
        try {
            const boardData = await boardsModel.find({_id: req.params.id})
            return res.json(boardData[0])
        } catch (e) {
            next(e);
        }
    }

    async newBoard(req, res, next) {
        try {
            const boardNew = new boardsModel(req.body)
            await boardNew.save()
            return res.json(boardNew)
        } catch (e) {
            next(e);
        }
    }

    async updateBoard(req, res, next) {
        try {
            const currentBoard = await boardsModel.findOne({_id: req.params.id})
            if (req.body.title === currentBoard.title) {
                console.log('обновление не требуется')
            } else{
                const newCurrentBoard =  await boardsModel.updateOne({_id: req.params.id}, {title: req.body.title})
            return res.json(newCurrentBoard)}
        } catch (e) {
            next(e);
        }
    }

}

module.exports = new BoardsController()