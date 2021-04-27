const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')

const year = 2021
const month = 8

router.get('/', function (req, res, next) {
    let days = storage.data.years[year][month]
    const monthData = {
        year,
        month,
        userId: 80776, // TODO replace with user ID from session context
        days
    }
    res.json(monthData)
})

router.post('/add', function (req, res, next) {
    console.log("add: " + req.body)
    res.json("add response")
})

router.post('/remove', function (req, res, next) {
    console.log("remove: " + req.body)
    res.json("remove response")
})

module.exports = router
