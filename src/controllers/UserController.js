const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user-model')
const BoardModel = require('../models/boards-model')


const generateAccessToken = (id, email) => {
    const payload = {
        id,
        email
    }
    return jwt.sign(payload, process.env.SECRET, {expiresIn: "12000000000h"})
}

class UserController {

    async registration(req, res, next) {
        try {
            const {email, password} = req.body;
            const candidate = await UserModel.findOne({email})
            if (candidate) {
                return res.status(400).json({message: `Пользователь с email ${email} уже существует`})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new UserModel({...req.body, password: hashPassword, boardIds: [], messages: []})
            await user.save()

            const newUser = await UserModel.findOne({email})
            const token = generateAccessToken(newUser._id, newUser.email)
            return res.json({...newUser, token})//TODO id, name, email
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const user = await UserModel.findOne({email})
            if (!user) {
                return res.status(400).json({message: `Пользователь ${email} не найден`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(400).json({message: `Введен неверный пароль`})
            }
            const token = generateAccessToken(user._id, user.email)
            await UserModel.updateOne({email}, {token})
            //TODO не отпарвлять пароль
            return res.json({...user, token})
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            await UserModel.updateOne({email: req.user.email}, {token: ''})
        } catch (e) {
            next(e)
        }
    }

    async checkLogin(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({email: req.user.email})
            if (!currentUser) return res.status(400).json({message: `Пользователь не авторизован`})
            return res.json({currentUser})
        } catch (e) {
            next(e)
        }
    }

    async shareBoard(req, res, next){
        try{
//Сделать проверку на отправленное приглашение
            const currentUser = await UserModel.findOne({_id: req.body._id})
            const targetUser = await UserModel.findOne({email: req.body.email})
            const currentBoard = await  BoardModel.findOne({_id: req.body.boardId})
            if (!targetUser) return res.status(400).json({message: `Пользователя не существует`})
            if(currentUser.email === targetUser.email) return res.status(400).json({message: `Вы не можете отправить приглашение самому себе`})
            const text = `Вам пришло приглашение от пользователя ${currentUser.email} на просмотр и редактирование доски  ${currentBoard.title}  Принять?`
            const message = {
                message: text,
                currentBoardId: currentBoard._id
            }
            targetUser.messages.push(message)
            targetUser.save()
            const targetUserNew = await UserModel.findOne({email: req.body.email})
            return res.json(targetUserNew.email)
        } catch(e){
            next(e)
        }
    }

    async applyInvite(req, res, next){
        try{
            const currentUser = await UserModel.findOne({_id: req.body.userId})

            currentUser.boardIds.push(req.body.boardId)
            currentUser.save()

            return res.json(currentUser)
        }catch (e){

        }
    }

}

module.exports = new UserController()