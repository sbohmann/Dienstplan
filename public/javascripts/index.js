window.onload = () => {
    fillTableContent()
}

let year
let month
let userId

function add(day, id, context) {
    alert("add " + context + " user " + id + " for day " + day)
}

function remove(day, id, context) {
    alert("remove " + context + " user " + id + " for day " + day)
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
        cell.textContent = data.name
        cell.classList.remove("add-button")
        cell.classList.add("remove-button")
        cell.onclick = () => remove(dayOfMonth, data.id, context)
    } else {
        cell.classList.remove("remove-button")
        cell.classList.add("add-button")
        cell.onclick = () => add(dayOfMonth, userId, context)
    }
}
