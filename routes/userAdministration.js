const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')

router.get('/', function (request, response) {
    ifAdmin(request, response, () => response.render('userAdministration'))
})

router.post('/add', function (request, response) {
    ifAdmin(request, response,  () => handleAddUserRequest(request, response))
})

router.post('/update', function (request, response) {
    ifAdmin(request, response,  () => handleUpdateUserRequest(request, response))
})

router.post('/resetPassword', function (request, response) {
    ifAdmin(request, response,  () => handleResetPasswordRequest(request, response))
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

function handleAddUserRequest(request, response) {
    try {
        addUser(request.body, response)
    } catch (error) {
        response.status(401)
    }
    response.send()
}

function addUser(userDetails, response) {
    // TODO
}

function handleUpdateUserRequest(request, response) {
    try {
        updateUser(request.body, response)
    } catch (error) {
        response.status(401)
    }
    response.send()
}

function updateUser(user, response) {
    // TODO
}

function handleResetPasswordRequest(request, response) {
    try {
        resetPassword(request.body.action, response)
    } catch (error) {
        response.status(401)
    }
    response.send()
}

function resetPassword(action, response) {
    // TODO
}

module.exports = router
