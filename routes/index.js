const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: "August 2021",
        month: "August",
        rows: [
            {weekday: "So", day: 1, sunday: true, reserve: "RESERVE_1"},
            {week_change: true},
            {weekday: "Mo", day: 2, name: "NAME_2", reserve: "RESERVE_2"},
            {weekday: "Di", day: 3, name: "NAME_2"},
            {weekday: "Mi", day: 4, reserve: "RESERVE_4"}
        ]
    })
})

module.exports = router
