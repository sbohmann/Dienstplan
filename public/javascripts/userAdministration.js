let userForId
let listView
let editUserDialog
let editUserNameInput
let editUserAdministratorInput

window.onload = () => {
    let columns = ListViewColumns({
        "id": "ID",
        "name": "Name",
        "admin": "Administrator"
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
            console.log(response)
            if (response.ok) {
                response.json().then(users => {
                    userForId = new Map()
                    for (let user of users) {
                        listView.add(user)
                        userForId.set(user.id, user)
                    }
                    init();
                })
            } else {
                console.log("Failed to fetch users")
            }
        })

    document
        .getElementById('userListContainer')
        .appendChild(listView.view)

    editUserDialog = document.getElementById('editUserDialog')
    editUserDialog.onclick = hideEditUserDialog
    editUserNameInput = document.getElementById('editUserNameInput')
    editUserAdministratorInput = document.getElementById('editUserAdministratorInput')
}

function init() {
    let editUserButton = document.getElementById('editUserButton')
    let editUserDialogTitle = document.getElementById('editUserDialogTitle')
    editUserButton.onclick = () => {
        let userId = listView.selectedId
        if (userId !== undefined) {
            setMultilineTextContent(editUserDialogTitle, "Benutzer " + userId)
            let user = userForId.get(userId);
            editUserNameInput.value = user.name
            editUserAdministratorInput.value = user.admin
            showEditUserDialog()
        }
    }
}

function showEditUserDialog() {
    editUserDialog.classList.add('active')
    document.body.classList.add('fixed')
}

function hideEditUserDialog() {
    document.body.classList.remove('fixed')
    editUserDialog.classList.remove('active')
}
