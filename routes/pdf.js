const express = require('express')
const router = express.Router()
const PDFDocument = require('pdfkit');
const storage = require('../storage/storage.js')

router.get('/:year/:month', function (request, response) {
    let userId = request.session.userId
    if (userId === undefined) {
        response.status(302)
        response.set('Location', '/login')
        response.send()
        return
    }
    let year = Number(request.params.year)
    let month = Number(request.params.month)
    if (!validYear(year) || !validMonth(month)) {
        console.log("Illegal year/month [" + year + "] / [" + month + "]")
        response.status(500)
        response.send()
        return
    }
    let days = storage.data.years[year][month]

    response.send('PDF :D ' + year + '-' + month + JSON.stringify(days))
})

function validYear(year) {
    return Number.isInteger(year) && year >= 1900
}

function validMonth(month) {
    return Number.isInteger(month) && month >= 1 && month <= 12
}

module.exports = router
