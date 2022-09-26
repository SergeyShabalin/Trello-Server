const {Schema, model} = require('mongoose');

const CardsSchema = new Schema({
    header: {type: String, unique: true, required: true},
    columns: {type: Schema.Types.ObjectId, unique:false, ref: 'columns', },
})

module.exports = model('сards', CardsSchema);