const boardsModel = require('../models/boards-model')

class BoardsController {
    async getAllBoards (req, res, next) {
        try {
            const deviceData = await boardsModel.find({})
            console.log(deviceData, boardsModel)
            return res.json(deviceData)

        } catch (e) {
            next(e);
        }
    }

    async newBoard (req, res, next) {
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