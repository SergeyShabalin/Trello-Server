const ColumnsModel = require('../models/columns-model');

class ColumnsService {

    async update(data, id) {
        await ColumnsModel.updateOne({_id: id}, data)
    }
}

module.exports = new ColumnsService();