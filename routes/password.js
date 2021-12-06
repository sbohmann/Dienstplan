const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const bcrypt = require('bcrypt')

router.get('/', function (req, res, next) {
    let userId = req.session.userId
    if (userId === undefined) {
        res.status(302)
        res.set('Location', '/login')
        res.send()
        return
    }
    res.render('password', {
        title: "Passwort ändern"
    })
})

router.post('/', function (request, result, next) {
    let userId
    let user

    function reply() {
        if (checkUserId()) {
            attemptPasswordChange()
        }
    }

    function checkUserId() {
        userId = request.session.userId
        if (userId === undefined) {
            result.status(302)
            result.set('Location', '/login')
            result.send()
            return false
        }
        return true
    }

    function attemptPasswordChange() {
        try {
            changePassword(request)
        } catch (error) {
            console.log("Password change failed for user [" + request.body.user + "]:", error)
            result.status(401)
            result.send(error.message)
        }
    }

    function changePassword(request) {
        user = storage.userForId.get(userId)
        if (user === undefined) {
            throw new Error("No user found for ID [" + userId + "]")
        }
        if (user.salt === undefined || user.hash === undefined) {
            throw new Error("No password configured for user [" + userId + "]")
        }
        console.log(request.body)
        checkCurrentPassword(request)
        // console.log("Password change failed for user [" + request.body.user + "]: " + error.message)
        result.status(200)
        result.send()
    }

    function checkCurrentPassword(request) {
        let user = storage.userForId.get(userId)
        if (user === undefined) {
            console.log("Unknown user ID [" + userId + "]")
            throw new Error("Benutzer-ID unbekannt")
        }
        if (user.salt === undefined || user.hash === undefined) {
            console.log("No password configured for user [" + userId + "]", user)
            throw new Error("Kein Passwort hinterlegt")
        }
        let calculatedHash = bcrypt.hashSync(request.body.current, user.salt)
        if (calculatedHash !== user.hash) {
            throw new Error("Aktuelles Passwort falsch")
        }
    }

    reply()
})

module.exports = router
