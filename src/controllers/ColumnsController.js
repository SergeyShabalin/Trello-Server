const columnsModel = require('../models/columns-model')

class ColumnsController {
    async getAllColumns (req, res, next) {
        try {
            const deviceData = await columnsModel.find({})
            console.log(deviceData, columnsModel)
            return res.json(deviceData)

        } catch (e) {
            next(e);
        }
}

    async newColumn (req, res, next) {
        try {
            const columnNew = new columnsModel(res)
            await columnNew.save()
            console.log(columnsModel)
            return res.json(columnNew)

        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ColumnsController()