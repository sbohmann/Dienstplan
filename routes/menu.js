const express = require('express')
const router = express.Router()

router.get('/menu', function (req, res, next) {
    let userId = req.session.userId
    if (!userId) {
        res.status(302)
        res.set('Location', '/login')
        res.send()
        return
    }
    let user = storage.userForId.get(userId)
    res.render('menu', {
        admin: user.admin || false
    })
})
