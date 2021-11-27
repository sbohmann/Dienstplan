let selectionDialog
let cancelUserSelectionButton

window.onload = () => {
    selectionDialog = document.getElementById('selectionDialog')
    cancelUserSelectionButton = document.getElementById('cancelUserSelectionButton')
    cancelUserSelectionButton.onclick = hideSelectionDialog
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

let users
let year
let month
let userId
let userIsAdmin

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
    request.onload = fillTableContent
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
    request.onload = fillTableContent
    request.send(JSON.stringify(data))
}

function fillTableContent(finishTableSetup) {
    const request = new XMLHttpRequest()
    request.open('GET', '/data', true)
    request.onload = () => {
        const data = JSON.parse(request.responseText)
        users = data.users
        year = data.year
        month = data.month
        userId = data.userId
        userIsAdmin = data.userIsAdmin
        const days = data.days
        for (let dayIndex = 0; dayIndex < days.length; ++dayIndex) {
            const dayOfMonth = dayIndex + 1
            const day = days[dayIndex]
            fill(day.primary, dayOfMonth, "primary")
            fill(day.reserve, dayOfMonth, "reserve")
            fill(day.secondReserve, dayOfMonth, "secondReserve")
        }
        if (finishTableSetup) {
            console.log(finishTableSetup)
            finishTableSetup()
        }
    }
    request.send()
}

function fill(data, dayOfMonth, context) {
    const id = context + '_' + dayOfMonth
    let cell = document.getElementById(id)
    if (data) {
        cell.classList.remove('add-button')
        if (userIsAdmin || data.id === userId) {
            cell.classList.add('remove-button')
            cell.onclick = () => {
                remove(dayOfMonth, data.id, context)
            }
        } else {
            cell.classList.remove('remove-button')
        }
        cell.textContent = data.name
    } else {
        cell.classList.remove('remove-button')
        cell.classList.add('add-button')
        cell.onclick = () => {
            if (userIsAdmin) {
                for (let user of users) {
                    const addUserButton = document.getElementById('addUserButton-' + user.id)
                    addUserButton.onclick = () => {
                        add(dayOfMonth, user.id, context)
                        hideSelectionDialog()
                    }
                }
                showSelectionDialog()
            } else {
                add(dayOfMonth, userId, context)
            }
        }
        cell.textContent = ""
    }
}

function showSelectionDialog() {
    selectionDialog.classList.add('active')
}

function hideSelectionDialog() {
    selectionDialog.classList.remove('active')
}
