const joda = require('@js-joda/core')

// TODO configuration
const RelevantMonthOffset = 2

module.exports = () => {
    const today = joda.LocalDate.now()
    const offset = today.dayOfMonth() >= 15
        ? RelevantMonthOffset + 1
        : RelevantMonthOffset
    const result = today
        .withDayOfMonth(1)
        .plusMonths(offset)
    return {
        year: result.year(),
        month: result.month().value(),
        editable: today.dayOfMonth() < 10 || today.dayOfMonth() >= 15
    }
}
