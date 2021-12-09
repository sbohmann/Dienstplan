const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')

router.get('/', function (req, res) {
    let userId = req.session.userId
    let user = storage.userForId.get(userId)
    res.render('menu', {
        admin: user.admin || false,
        title: "Verwaltung"
    })
})

module.exports = router
