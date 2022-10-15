const {Schema, model} = require('mongoose');

const ColumnsSchema = new Schema({
    header: {type: String, unique: false, required: false},
    cards: [{type: Schema.Types.ObjectId, ref: 'Cards', unique:false}],
})

module.exports = model('сolumns', ColumnsSchema);