const express = require('express')
const router = express.Router()
const fs = require('fs')

let weekdayName = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

let storedMonthFileContent = fs.readFileSync('test_data/2021/2021-08.json', 'utf8')

let storedMonth = JSON.parse(storedMonthFileContent)

let rows = []
for (let dayIndex = 0; dayIndex < storedMonth.days.length; ++dayIndex) {
    let day = storedMonth.days[dayIndex]
    // TODO get the date from storedMonth.year, storedMonth.month, and day.day
    if (dayIndex > 0 && day.dayOfWeek === 'Mo') { // TODO replace check for 'Mo' with week day lookup for the date
        rows.push({week_change: true})
    }
    let row = {
        day: day.dayOfMonth,
        weekday: day.dayOfWeek,
        name: day.primary ? day.primary.name : "",
        reserve: day.reserve ? day.reserve.name : "",
        second_reserve: day.secondReserve ? day.secondReserve.name : "",
        sunday: day.dayOfWeek === 'So' // TODO replace check for 'Mo' with week day lookup for the date
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
