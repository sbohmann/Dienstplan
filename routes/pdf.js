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
    document.font('Helvetica-Bold')
    let y = 130
    document.fontSize(24)
    document.text("Ärzte-Dienstplan C9", 100, y)
    y += 30
    document.text(dateNames.month[month - 1] + " " + year, 100, y)
    y += 40
    top = y
    const left = 90
    const right = 495
    const dayStep = 20
    const dayNameStep = 65
    document.fontSize(10)
    document.strokeColor('#aabbcc')
    document.moveTo(left, y - 4).lineTo(right,y - 4).stroke()
    let first = true
    for (let date = joda.LocalDate.of(year, month, 1), index = 0;
         date.monthValue() === month;
         date = date.plusDays(1), ++index) {
        const dayOfWeek = date.dayOfWeek()
        let monday = (dayOfWeek === joda.DayOfWeek.MONDAY)
        if (date.dayOfMonth() > 1 && monday) {
            if (!first) {
                document.strokeColor('#aabbcc')
                let x = left
                document.moveTo(x, top - 4).lineTo(x,y - 1).stroke()
                x += dayStep
                document.moveTo(x, top - 4).lineTo(x,y - 1).stroke()
                x += dayNameStep
                document.moveTo(x, top - 4).lineTo(x,y - 1).stroke()
                x = right
                document.moveTo(x, top - 4).lineTo(x,y - 1).stroke()
                document.fillColor('#aabbcc')
                document.rect(left, y - 3.5, right - left, 2).fill()
                y += 3
                top = y
                document.moveTo(left, y - 4).lineTo(right, y - 4).stroke()
            }
        }
        y += 2
        let day = days[index]
        document.fillColor('black')
        let x = left + 5
        document.text(date.dayOfMonth() + ".", x, y)
        x += dayStep
        document.text(dateNames.longWeekDay[dayOfWeek.ordinal()], x, y)
        // TODO limit text output to bounds inside the table cells
        x += dayNameStep
        if (day.primary !== undefined) {
            document.text(day.primary.name, 185, y)
        }
        y += 15
        document.strokeColor('#aabbcc')
        document.moveTo(left, y - 4).lineTo(right,y - 4).stroke()
        first = false
    }
    if (!first) {
        document.strokeColor('#aabbcc')
        let x = left
        document.moveTo(x, top - 4).lineTo(x,y - 4).stroke()
        x += dayStep
        document.moveTo(x, top - 4).lineTo(x,y - 4).stroke()
        x += dayNameStep
        document.moveTo(x, top - 4).lineTo(x,y - 4).stroke()
        x = right
        document.moveTo(x, top - 4).lineTo(x,y - 4).stroke()
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
