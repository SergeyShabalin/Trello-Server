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
            const currentUser = {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                boardIds: newUser.boardIds,
                messages: newUser.messages,
                firstName: newUser.firstName,
                secondName: newUser.secondName,
                lastName: newUser.lastName,
                avatar: newUser.avatar,
                background: newUser.background,
                position: newUser.position,
                department: newUser.department,
                organization: newUser.organization,
                birthDate: newUser.birthDate,
                token: token
            }
            return res.json(currentUser)
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
            const currentUser = await UserModel.findOne({email})

            const newUser = {
                boardIds: currentUser.boardIds,
                _id: currentUser._id,
                email: currentUser.email,
                firstName: currentUser.firstName,
                secondName: currentUser.secondName,
                lastName: currentUser.lastName,
                messages: currentUser.messages,
                isAuth: true,
                avatar: currentUser.avatar,
                background: currentUser.background,
                position: currentUser.position,
                department: currentUser.department,
                organization: currentUser.organization,
                birthDate: currentUser.birthDate,
                token
            }
            return res.json(newUser)
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
            else {
                const user = {
                    boardIds: currentUser.boardIds,
                    _id: currentUser._id,
                    messages: currentUser.messages,
                    email: currentUser.email,
                    firstName: currentUser.firstName,
                    secondName: currentUser.secondName,
                    lastName: currentUser.lastName,
                    isAuth: true,
                    avatar: currentUser.avatar,
                    background: currentUser.background,
                    position: currentUser.position,
                    department: currentUser.department,
                    organization: currentUser.organization,
                    birthDate: currentUser.birthDate,
                }
                return res.json(user)
            }
        } catch (e) {
            next(e)
        }
    }

    async shareBoard(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({_id: req._id})
            const targetUser = await UserModel.findOne({email: req.email})
            if (!targetUser) {
                return {errors: `Пользователя не существует`}
            } else {
                const currentBoard = await BoardModel.findOne({_id: req.boardId})
                const a = targetUser.boardIds.filter(id => id.toString() === req.boardId)
                if (a.length > 0) {
                    return {errors: `У пользователя уже есть доступ к этой доске`}
                } else {
                    if (currentUser.email === targetUser.email) return {errors: `Вы не можете отправить приглашение самому себе`}
                    const text = `Вам пришло приглашение от пользователя "${currentUser.email}" на просмотр и редактирование доски  "${currentBoard.title}"  Принять?`
                    const message = {
                        message: text,
                        currentBoardId: currentBoard._id
                    }
                    targetUser.messages.push(message)
                    targetUser.save()
                    console.log(targetUser)
                    return targetUser
                }
            }
        } catch (e) {
            console.log(e)
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
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    secondName: user.secondName,
                    avatar: user.avatar
                }
                return userInfo
            })

            return res.json(userList)
        } catch (e) {
            next(e)
        }
    }

    async deleteBoard(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({_id: req.body.userId})
            const newBoards = currentUser.boardIds.filter(id => id.toString() !== req.body.boardId.toString())
            currentUser.boardIds = newBoards
            await currentUser.save()
            const currentBoard = await BoardModel.findOne({_id: req.body.boardId})
            const newUsers = currentBoard.user_ids.filter(id => id.toString() !== req.body.userId.toString())
            currentBoard.user_ids = newUsers
            await currentBoard.save()
            return res.json(newBoards)
        } catch (e) {
            next(e)
        }
    }

    async updateUser(req, res, next) {
        try {
            await UserModel.updateOne({_id: req.body._id}, {
                avatar: req.body.avatar,
                secondName: req.body.secondName,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                background: req.body.background,
                position: req.body.position,
                department: req.body.department,
                organization: req.body.organization,
                birthDate: req.body.birthDate,
            })
            console.log('успешно обновлено')
            const updatedUser = await UserModel.findOne({_id: req.body._id})

            return res.json(updatedUser)
        } catch (e) {
            next(e)
        }
    }

    async downloadBackground(data, res) {
        try {
            await UserModel.updateOne({_id: data.userId}, {
                background: data.background,
            })

            const updatedUser = await UserModel.findOne({_id: data.userId})
            const updatedData = {
                _id: updatedUser._id,
                background: updatedUser.background
            }
            return updatedData

        } catch (e) {
            console.log(e)
        }
    }

    async downloadAvatar(data) {
        await UserModel.updateOne({_id: data.userId}, {
            avatar: data.avatar,
        })

        const updatedUser = await UserModel.findOne({_id: data.userId})
        const updatedData = {
            _id: updatedUser._id,
            avatar: updatedUser.avatar
        }
        return updatedData

    }

    async getUserInfo(req, res, next) {
        try {
            const currentUser = await UserModel.findOne({_id: req.params.userId})
            return res.json(currentUser)
        } catch (e) {
            next(e)
        }
    }

    async searchUser(req, res, next) {
        try {
            const currentBoard = await BoardModel.findOne({ _id: req.params.boardId });
            const userIds = currentBoard.user_ids.map((userId) => userId.toString());

            const userDictionary = {};
            const userData = await UserModel.find(
                { _id: { $in: userIds } },
                '_id email firstName secondName avatar'
            );
            userData.forEach((user) => {
                userDictionary[user._id.toString()] = {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    secondName: user.secondName,
                    avatar: user.avatar,
                };
            });

            const searchQuery = req.body.search.toLowerCase();

            const newUsers = userIds
                .map((userId) => userDictionary[userId])
                .filter((user) => user.email && user.email.toLowerCase().includes(searchQuery));

            return res.json(newUsers)

        } catch (e) {
            next(e)
        }
    }

    async changePersonalInfo(req, res, next) {
        const {oldPass, newPass, _id, email} = req.body
        try {
            if (oldPass && newPass) {
                const user = await UserModel.findOne({_id: _id})
                const validPassword = bcrypt.compareSync(oldPass, user.password)
                if (!validPassword) {
                    return res.status(400).json({message: `Старый пароль неверный`})
                } else {
                    const token = generateAccessToken(user._id, user.email)
                    const hashPassword = bcrypt.hashSync(newPass, 7);

                    await UserModel.update({_id: _id}, {token, password: hashPassword})
                    console.log('пароль изменен')
                    return res.json({token})
                }
            } else {
                const user = await UserModel.findOne({_id: _id})
                const token = generateAccessToken(user._id, user.email)
                await UserModel.update({_id: _id}, {token, email})
                console.log('email изменен')
                return res.json({token, email})
            }

        } catch (e) {
            next(e)
        }


    }


}

module.exports = new UserController()