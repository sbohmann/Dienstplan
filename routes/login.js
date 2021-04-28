const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const bcrypt = require('bcrypt')

router.get('/', function (req, res, next) {
    res.render('login')
})

router.post('/', function (req, res, next) {
    let userId = parseInt(req.body.user)
    if (checkLogin(userId, req.body.password)) {
        req.session.userId = userId
        res.status(302)
        res.set('Location', '/')
        res.send()
    } else {
        res.status(302)
        res.set('Location', '/login')
        res.send()
    }
})

function checkLogin(userId, password) {
    let user = storage.userForId.get(userId)
    if (!user) {
        return false
    }
    if (!user.salt || !user.hash) {
        return false
    }
    let calculatedHash = bcrypt.hashSync(password, user.salt)
    return calculatedHash === user.hash
}

module.exports = router
