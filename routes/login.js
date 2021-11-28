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
    let userName = parseInt(req.body.user)
    if (checkLogin(userName, req.body.password)) {
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

function checkLogin(userName, password) {
    let userId = storage.userIdForUserName.get(userName)
    if (userId === undefined) {
        console.log("Unknown user name [" + userName + "]")
        return false
    }
    let user = storage.userForId.get(userId)
    if (user === undefined) {
        console.log("Unknown user ID [" + userId + "]")
        return false
    }
    if (user.salt === undefined || user.hash === undefined) {
        console.log("No password configured for user [" + userId + "]")
        return false
    }
    let calculatedHash = bcrypt.hashSync(password, user.salt)
    return calculatedHash === user.hash
}

module.exports = router
