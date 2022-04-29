let userForId
let listView
let editUserDialog
let editUserNameInput
let editUserAdministratorInput

window.onload = () => {
    let columns = ListViewColumns({
        "id": "ID",
        "name": "Name",
        "admin": "Admin"
    })
    listView = ListView(columns)
    fetch('/userAdministration/users',
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                response.json().then(users => {
                    userForId = new Map()
                    for (let user of users) {
                        listView.add(userViewModel(user))
                        userForId.set(user.id, user)
                    }
                    init();
                })
            } else {
                console.log("Failed to fetch users")
            }
        })

    listView.view.id = 'userTable'
    document
        .getElementById('userListContainer')
        .appendChild(listView.view)

    editUserDialog = document.getElementById('editUserDialog')
    editUserNameInput = document.getElementById('editUserNameInput')
    editUserAdministratorInput = document.getElementById('editUserAdministratorInput')
}

function init() {
    let addUserButton = document.getElementById('addUserButton')
    let editUserButton = document.getElementById('editUserButton')
    let resetPasswordButton = document.getElementById('resetPasswordButton')
    let editUserDialogTitle = document.getElementById('editUserDialogTitle')
    let saveUserButton = document.getElementById('saveUserButton')
    let cancelEditUserButton = document.getElementById('cancelEditUserButton')
    addUserButton.onclick = () => {
        setMultilineTextContent(editUserDialogTitle, "Neuer Benutzer")
        editUserNameInput.value = ""
        editUserAdministratorInput.checked = false
        editUserAdministratorInput.disabled = false
        showEditUserDialog()
        saveUserButton.onclick = () => saveUser(undefined)
    }
    editUserButton.onclick = () => {
        let userId = listView.selectedId
        if (userId !== undefined) {
            setMultilineTextContent(editUserDialogTitle, "Benutzer " + userId)
            let user = userForId.get(userId);
            editUserNameInput.value = user.name
            editUserAdministratorInput.checked = user.admin
            editUserAdministratorInput.disabled = (user.id === 0)
            showEditUserDialog()
            saveUserButton.onclick = () => saveUser(user.id)
        }
    }
    resetPasswordButton.onclick = () => {
        let userId = listView.selectedId
        if (userId !== undefined) {
            resetPassword(userId)
        }
    }
    cancelEditUserButton.onclick = hideEditUserDialog
}

function showEditUserDialog() {
    editUserDialog.classList.add('active')
    document.body.classList.add('fixed')
}

function saveUser(userId) {
    let userName = editUserNameInput.value.trim()
    if (userName.length === 0) {
        alert("Name ist leer")
        return
    }
    hideEditUserDialog()
    let user = {
        id: userId,
        name: userName,
        admin: editUserAdministratorInput.checked
    }
    let adding = userId === undefined;
    let action = adding ? 'add' : 'update'
    fetch('/userAdministration/' + action,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => {
            if (response.ok) {
                response.json().then(result => {
                    handleResult(result.user, adding)
                    if (result.newPassword !== undefined) {
                        alert("Provisorisches Passwort für Benutzer " + result.user.id + ":\n" +
                            result.newPassword)
                    }
                })
            } else {
                console.log("Failed to save user - status:", response.status)
                alert("Speichern des Benutzers fehlgeschlagen")
            }
        })
}

function handleResult(user, adding) {
    if (adding) {
        listView.add(userViewModel(user))
    } else {
        listView.set(userViewModel(user))
    }
    userForId.set(user.id, user)
}

function hideEditUserDialog() {
    document.body.classList.remove('fixed')
    editUserDialog.classList.remove('active')
}

function resetPassword(userId) {
    fetch('/userAdministration/resetPassword',
        {
            method: 'POST',
            headers: {
                'Accept': "application/json",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId})
        })
        .then(response => {
            if (response.ok) {
                response.json().then(passwordResetResponse => {
                    alert("Password für Benutzer " + userId + " erfolgreich zurückgesetzt.\n" +
                        "Provisorisches Passwort:\n" +
                        passwordResetResponse.newPassword)
                })
            } else {
                console.log("Failed to reset password for user " + userId + " - status:", response.status)
                alert("Passwort-Reset für Benutzer " + userId + " fehlgeschlagen")
            }
        })
}

function userViewModel(user) {
    let result = {}
    Object.assign(result, user)
    result.admin = result.admin ? "Ja" : ""
    return result
}
