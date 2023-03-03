const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user-model')
const BoardModel = require('../models/boards-model')
const columnService = require("../services/Column-service");
const ColumnsModel = require("../models/columns-model");
const cardsModel = require("../models/cards-model");


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

    async shareBoard(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({_id: req.body._id})
            const targetUser = await UserModel.findOne({email: req.body.email})
            if (!targetUser) {
                return res.status(400).json({message: `Пользователя не существует`})
            } else {
                const currentBoard = await BoardModel.findOne({_id: req.body.boardId})
                const a = targetUser.boardIds.filter(id => id.toString() === req.body.boardId)
                if (a.length > 0) {
                    return res.status(400).json({message: `У пользователя уже есть доступ к этой доске`})
                } else {
                    if (currentUser.email === targetUser.email) return res.status(400).json({message: `Вы не можете отправить приглашение самому себе`})
                    const text = `Вам пришло приглашение от пользователя "${currentUser.email}" на просмотр и редактирование доски  "${currentBoard.title}"  Принять?`
                    const message = {
                        message: text,
                        currentBoardId: currentBoard._id
                    }
                    targetUser.messages.push(message)
                    targetUser.save()
                    const targetUserNew = await UserModel.findOne({email: req.body.email})
                    return res.json(targetUserNew.email)
                }
            }
        } catch (e) {
            next(e)
        }
    }

    async applyInvite(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({_id: req.body.userId})
            const currentBoard = await BoardModel.findOne({_id: req.body.boardId})
            currentUser.boardIds.filter(id => {
                if (id.toString() === req.body.boardId) return res.status(400).json({message: `У вас уже есть доступ к этой доске`})
            })
            currentUser.boardIds.push(req.body.boardId)
            currentBoard.user_ids.push(req.body.userId)
            currentUser.save()
            currentBoard.save()
            return res.json(currentBoard)
        } catch (e) {
            next(e)
        }
    }

    async deleteMessage(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({_id: req.body.userId})
            const newMessages = currentUser.messages.filter(item => item.currentBoardId.toString() !== req.body.boardId)
            await UserModel.updateOne({_id: req.body.userId}, {messages: newMessages})
            const newMessagesUser = await UserModel.findOne({_id: req.body.userId})
            return res.json(newMessagesUser.messages)
        } catch (e) {
            next(e)
        }
    }

    async getUsersOneBoard(req, res, next) {
        try {
            const currentBoard = await BoardModel.findOne({_id: req.body.boardId})
            const userData = await UserModel.find({})
            const userList = currentBoard.user_ids.map(userId => {
                const user = userData.find(user => user._id.toString() === userId.toString())
                const userInfo = {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    secondName: user.secondName
                }
                return userInfo
            })

            return res.json(userList)
        } catch (e) {
            next(e)
        }
    }


}

module.exports = new UserController()