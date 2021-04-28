const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')

router.get('/', function (req, res, next) {
    res.render('login')
})

router.post('/', function (req, res, next) {
    let userId = parseInt(req.body.user)
    if (storage.userForId.has(userId)) {
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

module.exports = router
