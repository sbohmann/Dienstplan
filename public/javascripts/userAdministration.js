let listView

window.onload = () => {
    let columns = ListViewColumns({
        "id": "ID",
        "name": "Name",
        "admin": "Administrator"
    })
    listView = ListView(columns)
    document
        .getElementById('userListContainer')
        .append(listView.view)
}
