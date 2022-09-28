const {Schema, model} = require('mongoose');

const CardsSchema = new Schema({
    header: {type: String, unique: true, required: true},
    columns: {type: Schema.Types.ObjectId, unique:false, ref: 'columns'},
    decisionDate: {type: Date, unique: false, required: true},
    checkList: [{type: Schema.Types.ObjectId, ref: 'checkList', unique:false}]
})

module.exports = model('сards', CardsSchema);