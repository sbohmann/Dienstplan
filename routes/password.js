const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const bcrypt = require('bcrypt')

router.get('/', function (request, response) {
    response.render('password', {
        title: "Passwort ändern"
    })
})

router.post('/', function (request, response) {
    let userId
    let user

    function reply() {
        if (checkUserId()) {
            attemptPasswordChange()
        } else {
            console.log("Unknown user [" + request.body.user + "]:")
            response.status(404)
            response.send("Unknown user")
        }
    }

    function checkUserId() {
        userId = request.session.userId
        if (userId === undefined) {
            response.status(302)
            response.set('Location', '/login')
            response.send()
            return false
        }
        return true
    }

    function attemptPasswordChange() {
        try {
            changePassword(request)
        } catch (error) {
            console.log("Password change failed for user [" + request.body.user + "]:", error)
            response.status(401)
            response.send(error.message)
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
        response.status(200)
        response.send()
    }

    function checkCurrentPassword(request) {
        let user = storage.userForId.get(userId)
        if (user === undefined) {
            console.log("Unknown user ID [" + userId + "]")
            throw new Error("Benutzer unbekannt")
        }
        if (user.salt === undefined || user.hash === undefined) {
            console.log("No password configured for user [" + userId + "]", user)
            throw new Error("Kein Passwort hinterlegt")
        }
        let newPassword = request.body.new
        // TODO remove
        console.log("setting salt and hash for new password", newPassword, request.body)
        let calculatedHash = bcrypt.hashSync(request.body.current, user.salt)
        if (calculatedHash !== user.hash) {
            throw new Error("Aktuelles Passwort falsch")
        }
        storage.setPassword(userId, newPassword)
    }

    reply()
})

module.exports = router
