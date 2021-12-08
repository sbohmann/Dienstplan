const express = require('express')
const router = express.Router()

router.post('/', function (req, res) {
    delete req.session.userId
    res.status(302)
    res.set('Location', '/login')
    res.send()
})

module.exports = router
