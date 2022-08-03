const express = require('express')
const router = express.Router()
const PDFDocument = require('pdfkit');
const storage = require('../storage/storage.js')
const dateNames = require('./dateNames')
const joda = require('@js-joda/core')

router.get('/months/:year/:month', function (request, response) {
    let year = Number(request.params.year)
    let month = Number(request.params.month)
    if (!validYear(year) || !validMonth(month)) {
        console.log("Illegal year/month [" + year + "] / [" + month + "]")
        response.status(500)
        response.send()
        return
    }
    let days = storage.data.years[year][month]
    response.setHeader('Content-Type', 'application/pdf');
    let document = new PDFDocument({size: 'A4'})
    document.image('pdf/c9_oeamtc.png', 10, 10, {scale: 0.5})
    document.image('pdf/wgv.png', 330, 5, {scale: 0.25})
    document.font('Helvetica')
    let y = 130
    document.fontSize(24)
    document.text("Ärzte-Dienstplan C9", 100, y)
    y += 30
    document.text(dateNames.month[month - 1] + " " + year, 100, y)
    y += 40
    top = y
    document.fontSize(10)
    document.strokeColor('#aabbcc')
    document.moveTo(95, y - 4).lineTo(495,y - 4).stroke()
    let first = true
    for (let date = joda.LocalDate.of(year, month, 1), index = 0;
         date.monthValue() === month;
         date = date.plusDays(1), ++index) {
        const dayOfWeek = date.dayOfWeek()
        let monday = (dayOfWeek === joda.DayOfWeek.MONDAY)
        if (date.dayOfMonth() > 1 && monday) {
            if (!first) {
                document.strokeColor('#aabbcc')
                document.moveTo(95, top - 4).lineTo(95,y - 1).stroke()
                document.moveTo(115, top - 4).lineTo(115,y - 1).stroke()
                document.moveTo(145, top - 4).lineTo(145,y - 1).stroke()
                document.moveTo(495, top - 4).lineTo(495,y - 1).stroke()
                document.fillColor('#aabbcc')
                document.rect(95, y - 3.5, 400, 2).fill()
                y += 3
                top = y
                document.moveTo(95, y - 4).lineTo(495, y - 4).stroke()
            }
        }
        let day = days[index]
        document.fillColor('black')
        document.text(date.dayOfMonth() + ".", 100, y)
        document.text(dateNames.weekDay[dayOfWeek.ordinal()], 120, y)
        // TODO limit text output to bounds inside the table cells
        if (day.primary !== undefined) {
            document.text(day.primary.name, 150, y)
        }
        y += 15
        document.strokeColor('#aabbcc')
        document.moveTo(95, y - 4).lineTo(495,y - 4).stroke()
        first = false
    }
    if (!first) {
        document.strokeColor('#aabbcc')
        document.moveTo(95, top - 4).lineTo(95,y - 4).stroke()
        document.moveTo(115, top - 4).lineTo(115,y - 4).stroke()
        document.moveTo(145, top - 4).lineTo(145,y - 4).stroke()
        document.moveTo(495, top - 4).lineTo(495,y - 4).stroke()
    }
    document.pipe(response)
    document.end()
})

function validYear(year) {
    return Number.isInteger(year) && year >= 1900
}

function validMonth(month) {
    return Number.isInteger(month) && month >= 1 && month <= 12
}

module.exports = router
