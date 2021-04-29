window.onload = () => {
    fillTableContent()
}

let year
let month
let userId

const selectionDialog = document.getElementById('selection-dialog')

function add(day, id, context) {
    // alert("add " + context + " user " + id + " for day " + day)
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
    // alert("remove " + context + " user " + id + " for day " + day)
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

function fillTableContent() {
    const request = new XMLHttpRequest()
    request.open('GET', '/data', true)
    request.onload = () => {
        const data = JSON.parse(request.responseText)
        year = data.year
        month = data.month
        userId = data.userId
        const days = data.days
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

function fill(data, dayOfMonth, context) {
    const id = context + '_' + dayOfMonth
    let cell = document.getElementById(id)
    if (data) {
        cell.classList.remove("add-button")
        cell.classList.add("remove-button")
        cell.onclick = () => {
            remove(dayOfMonth, data.id, context)
        }
        cell.textContent = data.name
    } else {
        cell.classList.remove("remove-button")
        cell.classList.add("add-button")
        cell.onclick = () => add(dayOfMonth, userId, context)
        cell.textContent = ""
    }
}

function showSelectionDialog() {

}

function hideSelectionDialog() {

}
