const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user-model')



const generateAccessToken = (id, email) => {
    const payload = {
        id,
        email
    }
    return jwt.sign(payload, process.env.SECRET, {expiresIn: "12h"} )
}

class UserController {

    async registration(req, res, next) {
        try {
            const {email, password} = req.body;
            const candidate = await UserModel.findOne({email})
            if (candidate) {
                return res.status(400).json({message: "Пользователь с таким именем уже существует"})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const user = new UserModel({...req.body, password: hashPassword })
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})
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
            if(!currentUser)  return res.status(400).json({message: `Пользователь не авторизован`})
            return res.json({currentUser})
        } catch (e) {
            next(e)
        }
    }

}

module.exports = new UserController()