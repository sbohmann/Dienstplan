let currentPasswordInput
let newPasswordInput
let repeatedPasswordInput
let changePasswordButton

let inputElements = []
let inputComplete = false
let inputCorrect = false
let passwordMismatch = false
let passwordTooWeak = false

window.onload = () => {
    setupControls()
    changePasswordButton.onclick = changePassword
}

function setupControls() {
    currentPasswordInput = getAndWireInput('current')
    newPasswordInput = getAndWireInput('new')
    repeatedPasswordInput = getAndWireInput('repetition')
    changePasswordButton = document.getElementById('changePassword')
    setButtonStatus()
}

function getAndWireInput(id) {
    let element = document.getElementById(id)
    element.onchange = setButtonStatus
    inputElements.push(element)
    return element
}

function setButtonStatus() {
    setInputStatus()
    changePasswordButton.disabled = !inputComplete || !inputCorrect
}

function setInputStatus() {
    inputComplete = isInputComplete()
    let newPasswordMismatch = false
    let newPasswordTooWeak = false
    if (!inputComplete) {
        inputCorrect = false
    } else if (!newPasswordsMatch()) {
        inputCorrect = false
        newPasswordMismatch = true
    } else if (newPasswordSufficientlyStrong()) {
        inputCorrect = false
        newPasswordTooWeak = true
    }
    inputCorrect = inputComplete && newPasswordsMatch()
    passwordMismatch = newPasswordMismatch
    passwordTooWeak = newPasswordTooWeak
}

function isInputComplete() {
    for (let element of inputElements) {
        if (element.value.trim().length === 0) {
            return false
        }
    }
    return true
}

function newPasswordsMatch() {
    let password = newPasswordInput.value
    if (repeatedPasswordInput.value !== newPasswordInput.value) {
        throw new RangeError("Unexpected password mismatch")
    }
    // TODO determine appropriate heuristics
    return password.length >= 12
}

function newPasswordSufficientlyStrong() {

}

function changePassword() {
    if (!inputComplete()) {
        return
    }
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
