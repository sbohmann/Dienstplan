const express = require('express')
const router = express.Router()
const joda = require('@js-joda/core')
const storage = require('../storage/storage.js')
const createError = require('http-errors')
const dateNames = require('./dateNames')

router.get('/', function (request, response) {
    let today = joda.LocalDate.now()
    let year = Number(today.year())
    let month = Number(today.monthValue())
    response.status(302)
    response.set('Location', '/months/' + year + '/' + month)
    response.send()
})

router.get('/months/:year/:month', function (request, response, next) {
    let userId = request.session.userId
    let month = {}
    month.year = Number(request.params.year)
    month.month = Number(request.params.month)
    if (!validYear(month.year) || !validMonth(month.month)) {
        return next(createError(404))
    }
    let userForId = storage.userForId.get(userId)
    let rows = buildRows(month)
    response.render('index', {
        title: dateNames.month[month.month - 1] + " " + month.year,
        month,
        month_name: dateNames.month[month.month - 1],
        rows,
        user_id: userId,
        user_name: userForId.name + (userForId.admin ? " (Administrator)" : ""),
        previousYearLink: monthLink(month, true, -1),
        previousMonthLink: monthLink(month, false, -1),
        nextMonthLink: monthLink(month, false, 1),
        nextYearLink: monthLink(month, true, 1)
    })
})

function validYear(year) {
    return Number.isInteger(year) && year >= 1900
}

function validMonth(month) {
    return Number.isInteger(month) && month >= 1 && month <= 12
}

function buildRows(month) {
    let result = []
    for (let date = joda.LocalDate.of(month.year, month.month, 1);
         date.monthValue() === month.month;
         date = date.plusDays(1)) {
        const dayOfWeek = date.dayOfWeek()
        let monday = (dayOfWeek === joda.DayOfWeek.MONDAY)
        let sunday = (dayOfWeek === joda.DayOfWeek.SUNDAY)
        if (date.dayOfMonth() > 1 && monday) {
            result.push({week_change: true})
        }
        let row = {
            day_of_month: date.dayOfMonth(),
            weekday: dateNames.weekDay[dayOfWeek.ordinal()],
            sunday
        }
        result.push(row)
    }
    return result
}

function monthLink(month, isYear, delta) {
    let currentMonthStart = joda.LocalDate.of(month.year, month.month, 1)
    let linkMonthStart = isYear ? currentMonthStart.plusYears(delta) : currentMonthStart.plusMonths(delta)
    return '/months/' + linkMonthStart.year() + '/' + linkMonthStart.monthValue()
}

module.exports = router
