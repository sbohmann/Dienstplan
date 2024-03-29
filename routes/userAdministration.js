const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')
const crypto = require('crypto')

router.get('/', function (request, response) {
    ifAdmin(request, response, () => response.render('userAdministration'))
})

router.get('/users', function (request, response) {
    ifAdmin(request, response, () => getUsers(response))
})

router.post('/add', function (request, response) {
    ifAdmin(request, response, () => handleAddUserRequest(request, response))
})

router.post('/update', function (request, response) {
    ifAdmin(request, response, () => handleUpdateUserRequest(request, response))
})

router.post('/resetPassword', function (request, response) {
    ifAdmin(request, response, () => handleResetPasswordRequest(request, response))
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
        reportUserDataError(error, response)
    }
    response.send()
}

function addUser(user, response) {
    if (user.id === 0) {
        throw new Error("Attempt to add user ID 0")
    }
    storage.addUser(user)
    // let newPassword = generateRandomPassword()
    // storage.setPassword(user.id, newPassword)
    storage.setPassword(user.id, user.name, true) // TODO enforce change
    response.send({
        user,
        newPassword: user.name
    })
}

function handleUpdateUserRequest(request, response) {
    try {
        updateUser(request.body, response)
        response.send()
    } catch (error) {
        reportUserDataError(error, response)
    }
}

function updateUser(user, response) {
    if (user.id === 0) {
        if (user.admin !== true) {
            throw new Error("Attempt to remove user ID 0 admin privilege")
        }
    }
    storage.updateUser(user)
    response.send({user})
}

function handleResetPasswordRequest(request, response) {
    try {
        resetPassword(Number(request.body.userId), response)
    } catch (error) {
        console.log(error)
        response.status(500)
    }
    response.send()
}

function resetPassword(userId, response) {
    let newPassword = generateRandomPassword()
    storage.setPassword(userId, newPassword)
    response.send({newPassword})
}

function generateRandomPassword() {
    return Array.from(crypto.randomBytes(6))
        .map(value => {
            const low = value & 0xf
            const high = value >> 4
            let first = String.fromCharCode(97 + low)
            let second = String.fromCharCode(107 + high)
            return first + second
        })
        .join('')
}

function reportUserDataError(error, response) {
    console.log(error)
    if (error instanceof storage.StorageError && error.key === storage.StorageError.USER_NAME_ALREADY_IN_USE) {
        response.status(400)
        response.send("Benutzername bereits in Verwendung")
    } else if (error instanceof storage.StorageError && error.key === storage.StorageError.ILLEGAL_USER_NAME) {
        response.status(400)
        response.send("Benutzername ist zu lang oder enthält nicht zulässige Zeichen")
    } else {
        response.status(500)
        response.send()
    }
}

module.exports = router
