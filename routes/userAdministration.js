const express = require('express')
const router = express.Router()
const storage = require('../storage/storage')

router.get('/', function (request, response) {
    ifAdmin(request, response, response.render('userAdministration'))
})

router.post('/', function (request, response) {
    ifAdmin(request, response,  handleUserUpdate(request, response))
})

function handleUserUpdate(request, response) {

}

function ifAdmin(request, response, action) {
    let user = storage.userForId.get(request.session.userId)
    if (!user.admin) {
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

module.exports = router
