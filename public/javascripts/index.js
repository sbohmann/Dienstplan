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
    console.log(initialData)
    const days = JSON.parse(initialData)
    for (day of days) {
        console.log(day)
    }
}
