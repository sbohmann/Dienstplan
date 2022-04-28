const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')

router.get('/', function (request, response) {
    ifAdmin(request, response, () => response.render('userAdministration'))
})

router.get('/users', function (request, response) {
    ifAdmin(request, response, () => getUsers(response))
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
    if (user.id === 0 || user.admin) {
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

function getUsers(response) {
    response.contentType('application/json')
    response.send(storage.data.users.map(minimalUserData))
}

function minimalUserData(user) {
    return {
        id: user.id,
        name: user.name,
        admin: !!user.admin
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

function addUser(user, response) {
    if (user.id === 0) {
        throw new Error("Attempt to add user ID 0")
    }
    console.log("Would add user", user)
    user.id = 99999
    response.send(user)
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
    if (user.id === 0) {
        if (user.admin !== true) {
            throw new Error("Attempt to remove user ID 0 admin privilege")
        }
    }
    console.log("Would update user", user)
    response.send(user)
}

function handleResetPasswordRequest(request, response) {
    try {
        resetPassword(request.body, response)
    } catch (error) {
        response.status(401)
    }
    response.send()
}

function resetPassword(change, response) {
    console.log("Would perform password change", change)
}

module.exports = router
