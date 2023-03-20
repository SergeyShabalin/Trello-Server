const {Schema, model} = require('mongoose');

const BoardsSchema = new Schema({
    title: {type: String, unique: false, required: false},
    columns: [{type: Schema.Types.ObjectId, ref: 'allColumns', unique:false}],
})

module.exports = model('Boards', BoardsSchema);