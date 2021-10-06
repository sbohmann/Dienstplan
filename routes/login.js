const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const bcrypt = require('bcrypt')

router.get('/', function (req, res, next) {
    res.render('login', {
        title: "Login"
    })
})

router.post('/', function (req, res, next) {
    let userId = parseInt(req.body.user)
    if (checkLogin(userId, req.body.password)) {
        req.session.userId = userId
        res.status(302)
        res.set('Location', '/')
        res.send()
    } else {
        console.log("Login failed for user [" + req.body.user + "]")
        res.status(302)
        res.set('Location', '/login')
        res.send()
    }
})

function checkLogin(userId, password) {
    let user = storage.userForId.get(userId)
    if (!user) {
        console.log("Unknown user [" + userId + "]")
        return false
    }
    if (!user.salt || !user.hash) {
        console.log("No password configured for user [" + userId + "]")
        return false
    }
    let calculatedHash = bcrypt.hashSync(password, user.salt)
    return calculatedHash === user.hash
}

module.exports = router
