let selectionDialog
let confirmationDialog
let confirmBookingButton
let editUserTitle
let bookingConfirmationText

let monthData
let users
let year
let month
let userId
let userIsAdmin
let userName

window.onload = () => {
    let match  = window.location.pathname.match(/\/(\d+)\/(\d+)/)
    year = Number(match[1])
    month = Number(match[2])
    selectionDialog = document.getElementById('selectionDialog')
    editUserTitle = document.getElementById('userSelectionText')
    document.getElementById('cancelUserSelectionButton').onclick = hideSelectionDialog
    confirmationDialog = document.getElementById('confirmationDialog')
    confirmationDialog.onclick = hideConfirmationDialog
    bookingConfirmationText = document.getElementById('bookingConfirmationText')
    document.getElementById('cancelBooking').onclick = hideConfirmationDialog
    confirmBookingButton = document.getElementById('confirmBooking')
    fillTableContent(() => {
        let selectionButtons = document.getElementById('selectionButtons')
        for (let user of users) {
            const addUserButton = document.createElement('button')
            addUserButton.id = 'addUserButton-' + user.id
            addUserButton.classList.add('dialogButton')
            addUserButton.textContent = user.name + " (" + user.id + ")"
            selectionButtons.appendChild(addUserButton)
        }
    })
}

function add(day, id, context, modifiedByAdmin) {
    const request = new XMLHttpRequest()
    request.open('POST', '/data/add/' + year + '/' + month, true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const data = {
        year,
        month,
        day,
        context,
        id,
        modifiedByAdmin
    }
    request.onload = () => {
        if (!requestSuccessful(request)) {
            alert("Failed to add booking. Probably not logged in. Please reload page.")
            return
        }
        fillTableContent()
    }
    request.send(JSON.stringify(data))
}

function remove(day, id, context) {
    const request = new XMLHttpRequest()
    request.open('POST', '/data/remove/' + year + '/' + month, true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const data = {
        year,
        month,
        day,
        context,
        id
    }
    request.onload = () => {
        if (!requestSuccessful(request)) {
            alert("Failed to remove booking. Probably not logged in. Please reload page.")
            return
        }
        fillTableContent()
    }
    request.send(JSON.stringify(data))
}

function fillTableContent(finishTableSetup) {
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
            fill(day.primary, dayOfMonth, "primary", true)
            fill(day.reserve, dayOfMonth, "reserve", false)
            fill(day.secondReserve, dayOfMonth, "secondReserve", false)
        }
        if (finishTableSetup) {
            finishTableSetup()
        }
    }
    request.send()
}

function fill(dayBookings, dayOfMonth, context, primary) {
    const id = context + '_' + dayOfMonth
    let cell = document.getElementById(id)
    if (dayBookings) {
        cell.classList.remove('add-button')
        if (userIsAdmin || dayBookings.id === userId) {
            cell.classList.add('remove-button')
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
        } else {
            cell.classList.remove('remove-button')
        }
        if (dayBookings.modifiedByAdmin) {
            cell.classList.add('administrator-modification')
        } else {
            cell.classList.remove('administrator-modification')
        }
        cell.textContent = dayBookings.name
    } else {
        cell.classList.remove('remove-button')
        cell.classList.add('add-button')
        cell.onclick = () => {
            if (userIsAdmin) {
                for (let user of users) {
                    const addUserButton = document.getElementById('addUserButton-' + user.id)
                    addUserButton.onclick = () => {
                        hideSelectionDialog()
                        add(dayOfMonth, user.id, context, true)
                    }
                }
                setMultilineTextContent(editUserTitle, [
                    "Benutzerauswahl",
                    date(dayOfMonth)
                ])
                showSelectionDialog()
            } else {
                if (bookingPermissible(primary)) {
                    confirmBookingButton.onclick = () => {
                        hideConfirmationDialog()
                        add(dayOfMonth, userId, context)
                    }
                    setMultilineTextContent(bookingConfirmationText, [
                        "Buchen " + userName,
                        date(dayOfMonth)])
                    showConfirmationDialog()
                } else {
                    alert(primary ?
                        "Maximal zwei Termine pro Monat" :
                        "Maximal drei Ersatztermine pro Monat")
                }
            }
        }
        cell.textContent = ""
    }
}

function bookingPermissible(primary) {
    if (primary) {
        let bookings = 0
        for (let day of monthData.days) {
            if (day.primary && day.primary.id === userId) {
                ++bookings
            }
        }
        if (bookings >= 2) {
            return false
        }
    }
    // else {
    //     let bookings = 0
    //     for (let day of monthData.days) {
    //         if (day.reserve && day.reserve.id === userId) {
    //             ++bookings
    //         }
    //         if (day.secondary && day.secondary.id === userId) {
    //             ++bookings
    //         }
    //     }
    //     if (bookings >= 3) {
    //         return false
    //     }
    // }
    return true
}

function showSelectionDialog() {
    selectionDialog.classList.add('active')
    document.body.classList.add('fixed')
}

function hideSelectionDialog() {
    document.body.classList.remove('fixed')
    selectionDialog.classList.remove('active')
}

function showConfirmationDialog() {
    confirmationDialog.classList.add('active')
    document.body.classList.add('fixed')
}

function hideConfirmationDialog() {
    document.body.classList.remove('fixed')
    confirmationDialog.classList.remove('active')
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
