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
    // TODO check against current user ID - rules still outstanding
    const dayIndex = req.body.day - 1
    let currentEntry = storage.data.years[year][month][dayIndex][req.body.context]
    if (currentEntry !== undefined) {
        throw RangeError("Attempting to add while ID present - current entru: " + JSON.stringify(currentEntry) +
            ", request: " + JSON.stringify(req.body))
    }
    storage.data.years[year][month][dayIndex][req.body.context] =
        {
            id: req.body.id,
            name: storage.userForId.get(req.body.id).name
        }
    res.send()
})

router.post('/remove', function (req, res, next) {
    // TODO check against current user ID - rules still outstanding
    const dayIndex = req.body.day - 1
    let currentId = storage.data.years[year][month][dayIndex][req.body.context].id
    if (currentId !== req.body.id) {
        throw RangeError("Attempting to remove non-matching ID - current: " + currentId +
            ", request: " + JSON.stringify(req.body))
    }
    storage.data.years[year][month][dayIndex][req.body.context] = undefined
    res.send()
})

module.exports = router
