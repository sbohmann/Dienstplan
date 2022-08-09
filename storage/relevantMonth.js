const joda = require('@js-joda/core')

// TODO configuration, plus add constant for the end of the editing period
const RelevantMonthOffset = 5

module.exports = () => {
    const now = joda.LocalDateTime.now()
    const offset = now.dayOfMonth() >= 15
        ? RelevantMonthOffset
        : RelevantMonthOffset - 1
    const result = now
        .withDayOfMonth(1)
        .plusMonths(offset)
    return {
        year: result.year(),
        month: result.month().value(),
        editable: insideEditingWindow(now)
    }
}

function insideEditingWindow(now) {
    if (now.dayOfMonth() > 15) {
        return true
    } else if (now.dayOfMonth() === 15) {
        return now.hour() >= 21
    } else if (now.dayOfMonth() < 10) {
        return true
    } else if (now.dayOfMonth() === 10) {
        return now.hour() < 21
    } else {
        return false
    }
}
