const express = require('express')
const router = express.Router()
const joda = require('@js-joda/core')
const storage = require('../storage/storage.js')

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
    let monday = (dayOfWeek === joda.DayOfWeek.MONDAY)
    if (date.dayOfMonth() > 1 && monday) {
        rows.push({week_change: true})
    }
    let row = {
        day_of_month: date.dayOfMonth(),
        weekday: weekdayName[dayOfWeek.ordinal()]
    }
    rows.push(row)
}

router.get('/', function (req, res, next) {
    let userId = req.session.userId
    if (userId === undefined) {
        res.status(302)
        res.set('Location', '/login')
        res.send()
        return
    }
    let userForId = storage.userForId.get(userId)
    res.render('index', {
        title: monthName[month - 1] + " " + year,
        month: monthName[month - 1],
        rows,
        user_id: userId,
        user_name: userForId.name + (userForId.admin ? " (Administrator)" : "")
    })
})

module.exports = router
