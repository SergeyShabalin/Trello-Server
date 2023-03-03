const {Schema, model} = require('mongoose');

const BoardsSchema = new Schema({
    title: {type: String, unique: false, required: false},
    background: {type: String, unique: false, required: false},
    columns: [{type: Schema.Types.ObjectId, ref: 'allColumns', unique:false}],
    user_ids: [{type: Schema.Types.ObjectId, unique: false, ref: 'User'}]
})

module.exports = model('Boards', BoardsSchema);