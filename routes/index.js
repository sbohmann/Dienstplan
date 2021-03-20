const express = require('express')
const router = express.Router()

let weekday_name = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

let rows = []

for (let day = 1, weekday = 0; day <= 31; ++day, weekday = (weekday + 1) % 7) {
    if (day > 0 && weekday === 1) {
        rows.push({week_change: true})
    }
    let row = {
        day: day,
        weekday: weekday_name[weekday],
        name: "NAME_" + day,
        reserve: "RESERVE_" + day,
        second_reserve: "SECOND_RESERVE_" + day,
        sunday: weekday === 0
    }
    rows.push(row)
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: "August 2021",
        month: "August",
        rows: [
            ...rows]
    })
})

module.exports = router
