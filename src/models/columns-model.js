const {Schema, model} = require('mongoose');

const ColumnsSchema = new Schema({
    header: {type: String, unique: false, required: false},
    cards: [{type: Schema.Types.ObjectId, ref: 'Cards', unique:false}],
    sortArr:[{type: Number, unique: false, required: false}],
    boardId: {type: Schema.Types.ObjectId, unique: false, ref: 'boards'}
})

module.exports = model('allColumns', ColumnsSchema);