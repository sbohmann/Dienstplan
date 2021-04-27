const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')

const year = 2021
const month = 8

router.get('/', function (req, res, next) {
    let days = storage.state.data.years[year][month]
    const monthData = {
        year,
        month,
        userId: 80776, // TODO replace with user ID from session context
        days
    }
    res.json(monthData)
})

router.post('/add', function (req, res, next) {
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
