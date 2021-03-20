window.onload = () => {
    document.getElementById('monday_0').appendChild(document.createTextNode('Vorname Nachname'))
}

function nameClicked(day) {
    alert('name clicked: ' + day)
}

function reserveClicked(day) {
    alert('reserve clicked: ' + day)
}

function secondaryReserveClicked(day) {
    alert('secondary reserve clicked: ' + day)
}
