const express = require('express')
const router = express.Router()
const storage = require('../storage/storage.js')

const year = 2021
const month = 8

const users = storage.data.users
    .map(user => ({
        id: user.id,
        name: user.name
    }))

router.get('/', function (req, res, next) {
    let userId = req.session.userId
    if (!userId) {
        res.status(401)
        res.send()
        return
    }
    let days = storage.data.years[year][month]
    let userForId = storage.userForId.get(userId)
    let userIsAdmin = !!userForId.admin
    const monthData = {
        users,
        year,
        month,
        userId,
        userIsAdmin,
        days
    }
    res.json(monthData)
})

function userIsAdminOrIdMatches(req) {
    let userForSessionUserId = storage.userForId.get(req.session.userId)
    let userIsAdmin = userForSessionUserId.admin
    return userIsAdmin || req.body.id === req.session.userId
}

router.post('/add', function (request, response, next) {
    if (!request.session.userId) {
        response.status(401)
        response.send()
        return
    }
    // TODO check against current user ID - rules still outstanding
    if (userIsAdminOrIdMatches(request)) {
        storage.add(
            year,
            month,
            request.body.day,
            request.body.context,
            request.body.id,
            JSON.stringify(request.body),
            () => response.send())
    } else {
        response.send();
    }
})

router.post('/remove', function (request, response, next) {
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
        response.send();
    }
})

module.exports = router
