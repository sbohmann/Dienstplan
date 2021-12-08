const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')
const joda = require('@js-joda/core')

const users = storage.data.users
    .map(user => ({
        id: user.id,
        name: user.name
    }))

router.get('/:year/:month', function (req, res) {
    let userId = req.session.userId
    if (userId === undefined) {
        res.status(401)
        res.send()
        return
    }
    let userName = storage.userForId.get(userId).name
    let year = Number(req.params.year)
    let month = Number(req.params.month)
    if (!validYear(year) || !validMonth(month)) {
        console.log("Illegal year/month [" + year + "] / [" + month + "]")
        res.status(500)
        res.send()
        return
    }
    createMonthIfMissing(year, month)
    let days = storage.data.years[year][month]
    let userForId = storage.userForId.get(userId)
    let userIsAdmin = !!userForId.admin
    const monthData = {
        users,
        year,
        month,
        userId,
        userName,
        userIsAdmin,
        days
    }
    res.json(monthData)
})

function createMonthIfMissing(year, month) {
    if (storage.data.years[year] === undefined) {
        storage.data.years[year] = {}
    }
    if (storage.data.years[year][month] === undefined) {
        storage.data.years[year][month] = []
        for (let day = joda.LocalDate.of(year, month, 1);
             day.monthValue() === month;
             day = day.plusDays(1)) {
            storage.data.years[year][month].push({})
        }
    }
}

function validYear(year) {
    return Number.isInteger(year) && year >= 1900
}

function validMonth(month) {
    return Number.isInteger(month) && month >= 1 && month <= 12
}

function userIsAdminOrIdMatches(req) {
    let userForSessionUserId = storage.userForId.get(req.session.userId)
    let userIsAdmin = userForSessionUserId.admin
    return userIsAdmin || req.body.id === req.session.userId
}

router.post('/add/:year/:month', function (request, response) {
    if (!request.session.userId) {
        response.status(401)
        response.send()
        return
    }
    let year = Number(request.params.year)
    let month = Number(request.params.month)
    if (!validYear(year) || !validMonth(month)) {
        console.log("Illegal year/month [" + year + "] / [" + month + "]")
        res.status(500)
        res.send()
        return
    }
    console.log('data.js')
    console.log(request.body.modifiedByAdmin)
    // TODO check against current user ID - rules still outstanding
    if (userIsAdminOrIdMatches(request)) {
        storage.add(
            year,
            month,
            request.body.day,
            request.body.context,
            request.body.id,
            request.body.modifiedByAdmin,
            JSON.stringify(request.body),
            () => response.send())
    } else {
        console.log("Attempt by non-admin user " + request.session.userId + " to add user " + request.body.id)
        response.send();
    }
})

router.post('/remove/:year/:month', function (request, response) {
    let year = Number(request.params.year)
    let month = Number(request.params.month)
    if (!validYear(year) || !validMonth(month)) {
        console.log("Illegal year/month [" + year + "] / [" + month + "]")
        res.status(500)
        res.send()
        return
    }
    // TODO check against current user ID - rules still outstanding
    if (userIsAdminOrIdMatches(request)) {
        storage.remove(
            year,
            month,
            request.body.day,
            request.body.context,
            request.body.id,
            JSON.stringify(request.body),
            () => response.send())
    } else {
        console.log("Attempt by non-admin user " + request.session.userId + " to remove user " + request.body.id)
        response.send();
    }``
})

module.exports = router
