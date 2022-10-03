const columnsModel = require('../models/columns-model')

class ColumnsController {
    async getAllColumns (req, res, next) {
        try {
            const deviceData = await columnsModel.find({})
            return res.json(deviceData)

        } catch (e) {
            next(e);
        }
}

    async newColumn (req, res, next) {
        try {
            console.log('res', req.body)
            const columnNew = new columnsModel(req.body)
            await columnNew.save()
            return res.json(columnNew)

        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ColumnsController()