const db = require('../db')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')
const authMiddleware = require('../middleware/authMiddleware')

const validEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
const validPassword = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}/g
const validNickname = /^[^0-9]\w+$/

const generateAccessToken = (uid, nickname) => {
    const payload = {
        uid, nickname
    }
    return jwt.sign(payload, secret, { expiresIn: "30m" })
}

function getUserUid(token){
    const decodedData = jwt.verify(token, secret)
    let uidUser = decodedData.uid
    return uidUser
}

class UserController {

    async create(req, res) {
        let uuid = uuidv4();
        const { email, password, nickname } = req.body
        if (!validEmail.test(String(email).toLowerCase())) {
            res.send('This email address is not valid')
        } else if (!validPassword.test(String(password))) {
            res.send('This password is not valid')
        } else if (!validNickname.test(String(nickname))) {
            res.send('This nickname is not valid')
        } else {
            const hashPassword = bcrypt.hashSync(password, 2)
            const newUser = await db.query('INSERT INTO user_account (uid, email, password, nickname) VALUES ($1, $2, $3, $4) RETURNING *', [uuid, email, hashPassword, nickname])
            res.json(newUser.rows[0])
        }
    }

    async login(req, res) {
        const { email, password } = req.body
        let loginUser = await db.query('SELECT email FROM user_account WHERE email = $1', [email])
        if (loginUser.rows.length != 0) {
            let passwordUser = await db.query('SELECT password FROM user_account WHERE email = $1', [email])
            passwordUser = passwordUser.rows[0].password
            const correctPassword = bcrypt.compareSync(password, passwordUser)
            if (correctPassword) {
                let uidUser = await db.query('SELECT uid FROM user_account WHERE email = $1', [email])
                uidUser = uidUser.rows[0].uid
                let nicknameUser = await db.query('SELECT nickname FROM user_account WHERE email = $1', [email])
                nicknameUser = nicknameUser.rows[0].nickname
                const token = generateAccessToken(uidUser, nicknameUser)
                let response = { 'token': token, 'expire': 1800 }
                res.send(response)
            } else {
                res.send('Wrong password')
            }
        } else {
            res.send(`User with email ${email} not found`)
        }
    }
    async logout(req, res) {
        res.send("You are logout")
    }
    async get(req, res) {
        const token = req.headers.authorization.split(' ')[1]
        let uidUser = getUserUid(token)
        let user = await db.query('SELECT email,nickname FROM user_account WHERE uid = $1', [uidUser])
        res.json(user.rows[0])
    }
    async update(req, res) {
        const token = req.headers.authorization.split(' ')[1]
        let uidUser = getUserUid(token)
        const { email, password, nickname } = req.body
        if (!validEmail.test(String(email).toLowerCase())) {
            res.send('This email address is not valid')
        } else if (!validPassword.test(String(password))) {
            res.send('This password is not valid')
        } else if (!validNickname.test(String(nickname))) {
            res.send('This nickname is not valid')
        } else {
            const hashPassword = bcrypt.hashSync(password, 2)
            await db.query('UPDATE user_account SET email = $1, password = $2, nickname = $3 WHERE uid = $4', [email, hashPassword, nickname, uidUser])
            let user = await db.query('SELECT email,nickname FROM user_account WHERE uid = $1', [uidUser])
            res.json(user.rows[0])
        }
    }
    async delete(req, res) {
        const token = req.headers.authorization.split(' ')[1]
        let uidUser = getUserUid(token)
        await db.query('DELETE FROM user_account WHERE uid = $1', [uidUser])
        res.send('User deleted successfully')
    }
}

module.exports = new UserController()