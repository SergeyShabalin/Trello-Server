const columnsModel = require('../models/columns-model')
const columnService = require('../services/Column-service')

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
            const columnNew = new columnsModel(req.body)
            await columnNew.save()
            return res.json(columnNew)

        } catch (e) {
            next(e);
        }
    }

    async deleteColumn(req, res, next) {
        console.log('params',req)
        try {
            const isDelete = await columnsModel.remove({_id:req.params.id})
            if(isDelete)res.send('device deleted')
            else res.send('the error deleted')
        } catch (e) {
            next(e);
        }
    }


    async updateColumn(req, res, next) {
        try {
            const refreshColumn = await columnService.update(req.body, req.params.id)
            return res.json(refreshColumn)
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ColumnsController()