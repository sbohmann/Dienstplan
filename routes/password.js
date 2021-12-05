const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const bcrypt = require('bcrypt')

router.get('/', function (req, res, next) {
    let userId = req.session.userId
    if (!userId) {
        res.status(302)
        res.set('Location', '/login')
        res.send()
        return
    }
    res.render('password', {
        title: "Passwort ändern"
    })
})

router.post('/', function (req, res, next) {
    function changePassword() {
        try {
            if (changePassword(userName, req)) {
                res.status(302)
                res.set('Location', '/')
                res.send()
            } else {
                console.log("Login failed for user [" + req.body.user + "]")
                res.status(302)
                res.set('Location', '/login')
                res.send()
            }
        } catch (error) {

        }
    }

    function checkUserId() {
        let userId = req.session.userId
        if (!userId) {
            res.status(302)
            res.set('Location', '/login')
            res.send()
        }
    }

    changePassword()
})

function changePassword(userName, req) {
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
    let calculatedHash = bcrypt.hashSync(req.body.password, user.salt)
    if (calculatedHash === user.hash) {
        req.session.userId = userId
        return true
    }
    return false
}

module.exports = router
