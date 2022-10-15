const ColumnsModel = require('../models/columns-model');

class ColumnsService {

    async update(data, id) {
        const lastHeader = await ColumnsModel.findOne({_id: id})

        if (lastHeader.header !== data.header) {
            await ColumnsModel.updateOne({_id: id}, {header: data.header})
            console.log('успешно обновлено')
        } else console.log('Обновление не требуется')
    }
}

module.exports = new ColumnsService();