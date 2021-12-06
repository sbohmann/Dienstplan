let currentPasswordInput
let newPasswordInput
let repeatedPasswordInput
let changePasswordButton
let passwordErrorMessageView

let inputElements = []
let inputComplete = false
let inputCorrect = false

window.onload = () => {
    setupControls()
    changePasswordButton.onclick = changePassword
}

function setupControls() {
    currentPasswordInput = getAndWireInput('current')
    newPasswordInput = getAndWireInput('new')
    repeatedPasswordInput = getAndWireInput('repetition')
    changePasswordButton = document.getElementById('changePassword')
    passwordErrorMessageView = document.getElementById('passwordErrorMessage')
    setButtonStatus()
}

function getAndWireInput(id) {
    let element = document.getElementById(id)
    element.oninput = setButtonStatus
    inputElements.push(element)
    return element
}

function setButtonStatus() {
    setInputStatus()
    changePasswordButton.disabled = !inputComplete || !inputCorrect
}

function setInputStatus() {
    inputComplete = isInputComplete()
    let passwordErrorMessage
    if (!inputComplete) {
        inputCorrect = false
    } else if (!newPasswordsMatch()) {
        inputCorrect = false
        passwordErrorMessage = "Eingaben für neues Paswort stimmen nicht überein"
    } else if (!newPasswordSufficientlyStrong()) {
        inputCorrect = false
        passwordErrorMessage = "Neues Passwort weniger als 12 Zeichen lang"
    }
    inputCorrect = inputComplete && newPasswordsMatch()
    if (passwordErrorMessage === undefined) {
        passwordErrorMessageView.textContent = undefined
        passwordErrorMessageView.setAttribute('hidden', '')
    } else {
        passwordErrorMessageView.textContent = passwordErrorMessage
        passwordErrorMessageView.removeAttribute('hidden')
    }
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
    let newPassword = newPasswordInput.value
    return repeatedPasswordInput.value === newPassword
}

function newPasswordSufficientlyStrong() {
    return newPassword().length >= 12
}

function newPassword() {
    let result = newPasswordInput.value
    if (repeatedPasswordInput.value !== result) {
        throw new RangeError("Unexpected password mismatch")
    }
    return result
}

function changePassword() {
    if (!inputComplete) {
        return
    }
    fetch('password',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: passwordChangeRequest()
        })
        .then(response => {
            console.log(response)
            if (response.ok) {
                alert("Passwort erfolgreich geändert")
                window.location.href = '/'
            } else {
                passwordErrorMessageView.textContent = response.body
                passwordErrorMessageView.removeAttribute('hidden')
            }
        })
}

function passwordChangeRequest() {
    return JSON.stringify({
        current: currentPasswordInput.value,
        new: newPasswordInput.value,
        repetition: repeatedPasswordInput.value
    })
}
