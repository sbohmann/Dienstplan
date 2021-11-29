const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const bcrypt = require('bcrypt')

router.get('/', function (req, res, next) {
    res.render('password', {
        title: "Passwort ändern"
    })
})

// router.post('/', function (req, res, next) {
//     let userName = req.body.user
//     if (checkLogin(userName, req)) {
//         res.status(302)
//         res.set('Location', '/')
//         res.send()
//     } else {
//         console.log("Login failed for user [" + req.body.user + "]")
//         res.status(302)
//         res.set('Location', '/login')
//         res.send()
//     }
// })
//
// function checkLogin(userName, req) {
//     let userId = storage.userIdForUserName.get(userName)
//     if (userId === undefined) {
//         console.log("Unknown user name [" + userName + "]")
//         return false
//     }
//     let user = storage.userForId.get(userId)
//     if (user === undefined) {
//         console.log("Unknown user ID [" + userId + "]")
//         return false
//     }
//     if (user.salt === undefined || user.hash === undefined) {
//         console.log("No password configured for user [" + userId + "]")
//         return false
//     }
//     let calculatedHash = bcrypt.hashSync(req.body.password, user.salt)
//     if (calculatedHash === user.hash) {
//         req.session.userId = userId
//         return true
//     }
//     return false
// }
//
// module.exports = router
