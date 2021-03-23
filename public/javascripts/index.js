window.onload = () => {
    buildTableContent()
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

function buildTableContent() {
    let days = JSON.parse(initialData)
    let table = document.getElementById('monats-dienstplan')

    for (let day of days) {
        let row = document.createElement('tr')
        row.appendChild(dayOWeek(day))
        row.appendChild(dayOMonth(day))
        table.appendChild(row)
    }
}

function dayOWeek(day) {
    let cell = document.createElement('td')
    cell.appendChild(document.createTextNode(day.dayOfWeek))
    return cell
}

function dayOMonth(day) {
    let cell = document.createElement('td')
    cell.appendChild(document.createTextNode(day.dayOfMonth + ". "))
    return cell
}
