function ListViewColumns(definition) {
    let columnIds = []
    let columnNames = new Map()
    for (let columnId in definition) {
        columnIds.push(columnId)
        columnNames.set(columnId, definition[columnId])
    }
    return {
        ids: columnIds,
        names: columnNames
    }
}

function ListView(columns) {
    let view = document.createElement('table')
    let rows = []

    function add(rowData) {
        let rowView = document.createElement('tr')
        for (let id of columns.ids) {
            let columnView = document.createElement('td')
            columnView.appendChild(document.createTextNode(rowData[id].toString()))
        }
        rows.push({
            id: rowData.id,
            view: rowView
        })
    }

    return {
        view
    }
}

ListViewColumns({
    "id": "ID",
    "name": "Name"
})
