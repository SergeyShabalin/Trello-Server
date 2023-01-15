const {Schema, model} = require('mongoose');

const CardsSchema = new Schema({
    title: {type: String, unique: false, required: true},
    description: {type: String, unique: false, required: false},
    column_id: {type: Schema.Types.ObjectId, unique: false, ref: 'allColumns'},
    decisionDate: {type: Date, unique: false, required: false},
    countTask: {type: Number, unique: false, required: false},
    doneTask: {type: Number, unique: false, required: false},
    order: {type: Number, unique: false, required: false},
    checkList: [{type: Schema.Types.ObjectId, ref: 'Checklist', unique: false}]
})

module.exports = model('allCards', CardsSchema);