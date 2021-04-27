const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')

const year = 2021
const month = 8

router.get('/', function (req, res, next) {
    const monthData = storage.data.years[year][month]
    res.json(monthData)
})

module.exports = router
