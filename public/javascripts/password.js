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
    setInputStatus()
}

function getAndWireInput(id) {
    let element = document.getElementById(id)
    element.oninput = setInputStatus
    inputElements.push(element)
    return element
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
    } else {
        inputCorrect = true
    }
    if (passwordErrorMessage === undefined) {
        passwordErrorMessageView.textContent = undefined
        passwordErrorMessageView.setAttribute('hidden', '')
    } else {
        passwordErrorMessageView.textContent = passwordErrorMessage
        passwordErrorMessageView.removeAttribute('hidden')
    }
    changePasswordButton.disabled = !inputCorrect
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
    fetch('/password',
        {
            method: 'POST',
            headers: {
                'Accept': 'text/plain',
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
                response.text().then(text => {
                    passwordErrorMessageView.textContent = text
                    passwordErrorMessageView.removeAttribute('hidden')
                })
            }
        })
}

function passwordChangeRequest() {
    return JSON.stringify({
        current: currentPasswordInput.value,
        new: newPasswordInput.value
    })
}
