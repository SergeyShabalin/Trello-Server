const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    email: {type: String, unique: false, required: false},
    password: {type: String, unique: false, required: false},
    boardIds:[ {type: Schema.Types.ObjectId, unique: false, ref: 'boards'}],
    firstName: {type: String, unique: false, required: false},
    secondName: {type: String, unique: false, required: false},
    lastName: {type: String, unique: false, required: false},
    token: {type: String, unique: false, required: false},
    messages: [{type: Object, unique: false, required: false}],
    avatar: {type: String, unique: false, required: false},
})

module.exports = model('User', UserSchema);