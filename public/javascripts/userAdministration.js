let listView

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
                    for (let user of users) {
                        listView.add(user)
                    }
                })
            } else {
                console.log("Failed to fetch users")
            }
        })
    document
        .getElementById('userListContainer')
        .appendChild(listView.view)
}
