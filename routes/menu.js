const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')

router.get('/', function (req, res) {
    let userId = req.session.userId
    if (userId === undefined) {
        res.status(302)
        res.set('Location', '/login')
        res.send()
        return
    }
    let user = storage.userForId.get(userId)
    res.render('menu', {
        admin: user.admin || false,
        title: "Verwaltung"
    })
})

module.exports = router
