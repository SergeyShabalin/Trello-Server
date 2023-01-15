const {Schema, model} = require('mongoose');

const ChecklistSchema = new Schema({
    task: {type: String, unique: false, required: true},
    done: {type: Boolean, unique: false, required: true},
    cardId:{type: Schema.Types.ObjectId, ref: 'allCards'}
})

module.exports = model('Checklist', ChecklistSchema);