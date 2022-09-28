const {Schema, model} = require('mongoose');

const ChecklistSchema = new Schema({
    task: {type: String, unique: true, required: true},
    done: {type: Boolean, unique: false, required: true},
})

module.exports = model('checklist', ChecklistSchema);