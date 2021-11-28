let selectionDialog
let confirmationDialog
let confirmBookingButton
let cancelUserSelectionButton
let bookingConfirmationText

window.onload = () => {
    selectionDialog = document.getElementById('selectionDialog')
    cancelUserSelectionButton = document.getElementById('cancelUserSelectionButton')
    cancelUserSelectionButton.onclick = hideSelectionDialog
    confirmationDialog = document.getElementById('confirmationDialog')
    document.getElementById('cancelBooking').onclick = hideConfirmationDialog
    confirmBookingButton = document.getElementById('confirmBooking')
    bookingConfirmationText = document.getElementById('bookingConfirmationText')
    fillTableContent(() => {
        let selectionButtons = document.getElementById('selectionButtons')
        for (let user of users) {
            const addUserButton = document.createElement('button')
            addUserButton.id = 'addUserButton-' + user.id
            addUserButton.classList.add('selectUserButton')
            addUserButton.textContent = user.name + " (" + user.id + ")"
            selectionButtons.appendChild(addUserButton)
        }
    })
}

let monthData
let users
let year
let month
let userId
let userIsAdmin
let userName

function add(day, id, context) {
    const request = new XMLHttpRequest()
    request.open('POST', '/data/add', true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const data = {
        year,
        month,
        day,
        context,
        id
    }
    request.onload = () => fillTableContent()
    request.send(JSON.stringify(data))
}

function remove(day, id, context) {
    const request = new XMLHttpRequest()
    request.open('POST', '/data/remove', true)
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const data = {
        year,
        month,
        day,
        context,
        id
    }
    request.onload = () => fillTableContent()
    request.send(JSON.stringify(data))
}

function fillTableContent(finishTableSetup) {
    const request = new XMLHttpRequest()
    request.open('GET', '/data', true)
    request.onload = () => {
        monthData = JSON.parse(request.responseText)
        users = monthData.users
        year = monthData.year
        month = monthData.month
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
                bookingConfirmationText.textContent = "Entfernen " + dayBookings.name + " " + date(dayOfMonth)
                showConfirmationDialog()
            }
        } else {
            cell.classList.remove('remove-button')
        }
        if (dayBookings.modifiedByAdmin) {
            console.log(dayBookings)
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
                        add(dayOfMonth, user.id, context)
                    }
                }
                showSelectionDialog()
            } else {
                if (bookingPermissible(primary)) {
                    confirmBookingButton.onclick = () => {
                        hideConfirmationDialog()
                        add(dayOfMonth, userId, context)
                    }
                    bookingConfirmationText.textContent = "Buchen " + userName + " " + date(dayOfMonth)
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
    } else {
        let bookings = 0
        for (let day of monthData.days) {
            if (day.reserve && day.reserve.id === userId) {
                ++bookings
            }
        }
        for (let day of monthData.days) {
            if (day.secondReserve && day.secondReserve.id === userId) {
                ++bookings
            }
        }
        if (bookings >= 3) {
            return false
        }
    }
    return true
}

function showSelectionDialog() {
    selectionDialog.classList.add('active')
}

function hideSelectionDialog() {
    selectionDialog.classList.remove('active')
}

function showConfirmationDialog() {
    confirmationDialog.classList.add('active')
}

function hideConfirmationDialog() {
    confirmationDialog.classList.remove('active')
}

function date(dayOfMonth) {
    return year + "-" + twoDigits(month) + "-" + twoDigits(dayOfMonth)
}

function twoDigits(n) {
    return n < 10 ? "0" + n : n
}
