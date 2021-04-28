const express = require('express')
const router = express.Router()

router.get('/', function (req, res, next) {
    res.render('login')
})

router.post('/', function (req, res, next) {
    req.session.userId = 80776
    res.status(302)
    res.set('Location', '/')
    res.send()
})

module.exports = router
