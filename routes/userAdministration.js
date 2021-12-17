const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')

router.get('/', function (request, response) {
    ifAdmin(request, response, response.render('userAdministration'))
})

router.post('/', function (request, response) {
    ifAdmin(request, response,  handleUpdateUserRequest(request, response))
})

function ifAdmin(request, response, action) {
    let user = storage.userForId.get(request.session.userId)
    if (user.admin) {
        action(request, response)
    } else {
        if (request.method === 'GET') {
            response.status(302)
            response.set('Location', '/')
            response.send()
        } else {
            response.status(401)
            response.send()
        }
    }
}

function handleUpdateUserRequest(request, response) {
    try {
        performUserUpdate(request.body.action, response)
    } catch (error) {
        response.status(401)
    }
    response.send()
}

function performUserUpdate(action, response) {
    switch (action.command) {
        case 'passwordReset':
            resetPassword(action.userId, response)
            break
        default:
            throw RangeError('Unknown user administration command [' + action.command + "]")
    }
}

function resetPassword(userId, response) {
    // TODO implement
}

module.exports = router
