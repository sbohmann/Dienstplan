window.onload = () => {
    fillTableContent()
}

function addPrimary(day, id, name) {
    alert("add primary user " + id + " (" + name + ") for day " + day)
}

function removePrimary(day, id, name) {
    alert("remove primary user " + id + " (" + name + ") for day " + day)
}

function addReserve(day, id, name) {
    alert("add reserve user " + id + " (" + name + ") for day " + day)
}

function removeReserve(day, id, name) {
    alert("remove reserve user " + id + " (" + name + ") for day " + day)
}

function addSecondaryReserve(day, id, name) {
    alert("add secondary reserve user " + id + " (" + name + ") for day " + day)
}

function removeSecondaryReserve(day, id, name) {
    alert("remove secondary reserve user " + id + " (" + name + ") for day " + day)
}

function fillTableContent() {
    const request = new XMLHttpRequest()
    request.open('GET', '/data', true)
    request.onload =() => {
        const initialData =request.responseText
        const days = JSON.parse(initialData)
        for (let dayIndex = 0; dayIndex < days.length; ++dayIndex) {
            const dayOfMonth = dayIndex + 1
            const day = days[dayIndex]
            fill('primary_' + dayOfMonth, day.primary, dayOfMonth)
            fill('reserve_' + dayOfMonth, day.reserve, dayOfMonth)
            fill('secondReserve_' + dayOfMonth, day.secondReserve, dayOfMonth)
        }
    }
    request.send()
}

function fill(id, data, dayOfMonth) {
    if (data) {
        let cell = document.getElementById(id)
        cell.textContent = data.name
        cell.classList.remove("add-button")
        cell.classList.add("remove-button")
        cell.onclick = () => removePrimary(dayOfMonth, data.id, data.name)
    }
}
