const ColumnsModel = require('../models/columns-model');
const CardsModel = require('../models/cards-model')

class ColumnsService {

    async update(data, id) {
        const lastHeader = await ColumnsModel.findOne({_id: id})

        if (lastHeader.header !== data.header) {
            await ColumnsModel.updateOne({_id: id}, {header: data.header})
            console.log('успешно обновлено')
        } else console.log('Обновление не требуется')
    }

    async dragDrop(data, id) {
        // const targetColumn = CardsModel.find({_id: data.targetColumnId})
        const currentColumn = await ColumnsModel.findOne({_id: id})
        const cardS = await CardsModel.find({column_id: id})

      const dd =  cardS.filter(item=>item._id !== data.currentCardId)
        //TODO нужно удалить из currentColumn CurrentCard

        // await ColumnsModel.updateOne({_id: id}, {cards: 'l;jo;j;' })


        const card = await CardsModel.findOne({_id: data.currentCardId})
        const cardT = await CardsModel.find({column_id: data.targetColumnId})
        cardT.push(card)
         await ColumnsModel.updateOne({_id: data.targetColumnId}, {cards: cardT })
                console.log('успешно обновлено')
        //     } else console.log('Обновление не требуется')
    }

}

module.exports = new ColumnsService();