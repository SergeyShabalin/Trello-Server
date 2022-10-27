const {Schema, model} = require('mongoose');

const CardsSchema = new Schema({
    header: {type: String, unique: false, required: true},
    description: {type: String, unique: false, required: false},
    column_id: {type: Schema.Types.ObjectId, unique:false, ref: 'columns'},
    decisionDate: {type: Date, unique: false, required: false},
    checkList: [{type: Schema.Types.ObjectId, ref: 'Checklist', unique:false}]
})

module.exports = model('Cards', CardsSchema);