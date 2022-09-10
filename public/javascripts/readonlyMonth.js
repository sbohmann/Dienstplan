window.onload = () => {
    let match  = window.location.pathname.match(/\/(\d+)\/(\d+)/)
    year = Number(match[1])
    month = Number(match[2])
    fillTableContent()
}

function fillTableContent() {
    const request = new XMLHttpRequest()
    request.open('GET', '/data/months/' + year + '/' + month, true)
    request.onload = () => {
        if (!requestSuccessful(request)) {
            alert("Failed to fetch data. Probably not logged in. Please reload page.")
            return
        }
        monthData = JSON.parse(request.responseText)
        users = monthData.users
        // TODO replace assignment with checks for year and month
        // year = monthData.year
        // month = monthData.month
        userId = monthData.userId
        userName = monthData.userName
        userIsAdmin = monthData.userIsAdmin
        const days = monthData.days
        for (let dayIndex = 0; dayIndex < days.length; ++dayIndex) {
            const dayOfMonth = dayIndex + 1
            const day = days[dayIndex]
            fill(day.primary, dayOfMonth, "primary")
            fill(day.reserve, dayOfMonth, "reserve")
            fill(day.secondReserve, dayOfMonth, "secondReserve")
        }
    }
    request.send()
}

function fill(dayBookings, dayOfMonth, context) {
    const id = context + '_' + dayOfMonth
    let cell = document.getElementById(id)
    if (dayBookings) {
        cell.classList.add('booked')
        if (userIsAdmin || dayBookings.id === userId) {
            cell.onclick = () => {
                confirmBookingButton.onclick = () => {
                    hideConfirmationDialog()
                    remove(dayOfMonth, dayBookings.id, context)
                }
                setMultilineTextContent(bookingConfirmationText, [
                    "Entfernen " + dayBookings.name,
                    date(dayOfMonth)])
                showConfirmationDialog()
            }
        }
        if (dayBookings.modifiedByAdmin) {
            cell.classList.add('administrator-modification')
        } else {
            cell.classList.remove('administrator-modification')
        }
        cell.textContent = dayBookings.name.toUpperCase()
    } else {
        cell.textContent = ""
        cell.classList.remove('administrator-modification')
    }
}

function date(dayOfMonth) {
    return year + "-" + twoDigits(month) + "-" + twoDigits(dayOfMonth)
}

function twoDigits(n) {
    return n < 10 ? "0" + n : n
}

function requestSuccessful(request) {
    return request.status >= 200 && request.status < 300
}
