const {Schema, model} = require('mongoose');

const ColumnsSchema = new Schema({
    header: {type: String, unique: true, required: false},
    cards: [{type: Schema.Types.ObjectId, ref: 'cards', unique:false}],
})

module.exports = model('сolumns', ColumnsSchema);