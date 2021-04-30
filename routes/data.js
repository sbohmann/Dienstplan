const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')

const year = 2021
const month = 8

const users = storage.data.users
    .map(user => ({
        id: user.id,
        name: user.name
    }))

router.get('/', function (req, res, next) {
    let userId = req.session.userId
    if (!userId) {
        res.status(401)
        res.send()
        return
    }
    let days = storage.data.years[year][month]
    const monthData = {
        users,
        year,
        month,
        userId,
        days
    }
    res.json(monthData)
})

router.post('/add', function (req, res, next) {
    if (!req.session.userId) {
        res.status(401)
        res.send()
        return
    }
    // TODO check against current user ID - rules still outstanding
    storage.add(
        year,
        month,
        req.body.day,
        req.body.context,
        req.body.id,
        JSON.stringify(req.body),
        () => res.send())
})

router.post('/remove', function (req, res, next) {
    // TODO check against current user ID - rules still outstanding
    storage.remove(
        year,
        month,
        req.body.day,
        req.body.context,
        req.body.id,
        JSON.stringify(req.body),
        () => res.send())
})

module.exports = router
