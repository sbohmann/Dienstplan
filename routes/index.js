const express = require('express')
const router = express.Router()
const joda = require('@js-joda/core')

const year = 2021
const month = 8

let weekdayName = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
let monthName = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember"]

let rows = []
for (let date = joda.LocalDate.of(year, month, 1);
     date.month().value() === month;
     date = date.plusDays(1)) {
    const dayOfWeek = date.dayOfWeek()
    let sunday = (dayOfWeek === joda.DayOfWeek.SUNDAY)
    if (date.dayOfMonth() > 1 && sunday) {
        rows.push({week_change: true})
    }
    let row = {
        day_of_month: date.dayOfMonth(),
        weekday: weekdayName[dayOfWeek.ordinal()],
        sunday
    }
    rows.push(row)
}

router.get('/', function (req, res, next) {
    res.render('index', {
        title: monthName[month] + " " + year,
        month: monthName[month],
        rows,
        user_id: 80776,
        user_name: "Steinis"
    })
})

module.exports = router
