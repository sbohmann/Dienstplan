const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const bcrypt = require('bcrypt')

router.get('/', function (req, res) {
    res.render('login', {
        title: "Login"
    })
})

router.post('/', function (req, res) {
    let userName = req.body.user
    let success = (userId) => {
        req.session.userId = userId
        res.status(302)
        res.set('Location', '/')
        res.send()
    }
    let failure = () => {
        console.log("Login failed for user [" + userName + "]")
        res.status(302)
        res.set('Location', '/login')
        res.send()
    }
    login(userName, req.body.password, success, failure)
})

function login(userName, password, success, failure) {
    let userId = storage.userIdForUserName.get(userName)
    if (userId === undefined) {
        console.log("Unknown user name [" + userName + "]")
        failure()
    } else {
        loginWithUserId(userId, password, success, failure)
    }
}

function loginWithUserId(userId, password, success, failure) {
    let user = storage.userForId.get(userId)
    if (user === undefined) {
        console.log("Unknown user ID [" + userId + "]")
        failure()
    } else if (user.salt === undefined || user.hash === undefined) {
        console.log("No password configured for user [" + userId + "]")
        failure()
    } else {
        let calculatedHash = bcrypt.hashSync(password, user.salt)
        if (calculatedHash === user.hash) {
            success(userId)
        } else {
            failure()
        }
    }
}

module.exports = router
