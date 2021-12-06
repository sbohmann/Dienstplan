let currentPasswordInput
let newPasswordInput
let repeatedPasswordInput
let changePasswordButton

let inputElements = []

window.onload = () => {
    setupControls()
    changePasswordButton.onclick = changePassword
}

function setupControls() {
    currentPasswordInput = getAndWireInput('current')
    newPasswordInput = getAndWireInput('new')
    repeatedPasswordInput = getAndWireInput('repetition')
    changePasswordButton = getAndWireInput('changePassword')
    setButtonStatus()
}

function getAndWireInput(id) {
    let element = document.getElementById(id)
    element.onchange = setButtonStatus
    inputElements.push(element)
    return element
}

function setButtonStatus() {
    changePasswordButton.disabled = !changePasswordButtonEnabled()
}

function changePasswordButtonEnabled() {
    for (let element of inputElements) {
        if (element.value.trim().length === 0) {
            return false
        }
    }
    return true
}

function changePassword() {
    fetch('password', {method: 'POST', body: passwordChangeRequest()})
        .then(response => {
            console.log(response)
        })
}

function passwordChangeRequest() {
    return {
        current: currentPasswordInput.value,
        new: newPasswordInput.value,
        repetition: repeatedPasswordInput.value
    }
}
