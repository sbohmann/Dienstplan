function ListViewColumns(definition) {
    let result = new Map()
    for (let columnId in definition) {
        result.set(columnId, definition[columnId])
    }
    return result
}

function ListView(columns) {
    let tableView = document.createElement('table')
    let rows = new Map()
    let selection = undefined

    function addHeader() {
        let header = document.createElement('tr')
        for (let [, value] of columns.entries()) {
            let column = document.createElement('th')
            column.appendChild(document.createTextNode(value))
            header.appendChild(column)
        }
        tableView.appendChild(header)
    }

    function add(rowData) {
        if (rowData.id !== undefined && rowData.id !== null) {
            if (rows.get(rowData.id) !== undefined) {
                throw Error("Attempt to add duplicate ID " + rowData.id)
            }
        }
        let rowView = document.createElement('tr')
        for (let id of columns.keys()) {
            let column = document.createElement('td')
            column.appendChild(document.createTextNode(rowData[id].toString()))
            rowView.appendChild(column)
        }
        tableView.appendChild(rowView)
        rows.set(rowData.id, {
            id: rowData.id,
            view: rowView
        })
        rowView.onclick = () => {
            let currentSelection = selection
            selection = rows.get(rowData.id)
            if (currentSelection !== selection) {
                if (currentSelection !== undefined) {
                    currentSelection.view.classList.remove('selectedRow')
                }
                if (selection !== undefined) {
                    selection.view.classList.add('selectedRow')
                }
            }
        }
    }

    function set(rowData) {
        if (rowData.id === undefined || rowData.id === null) {
            throw Error("Attempt to set row value without ID")
        }
        let row = rows.get(rowData.id);
        if (row === undefined) {
            throw Error("Attempt to set row value with unknown ID " + rowData.id)
        }
        removeContent(row.view)
        for (let id of columns.keys()) {
            let column = document.createElement('td')
            column.appendChild(document.createTextNode(rowData[id].toString()))
            row.view.appendChild(column)
        }
        rows.set(rowData.id, {
            id: row.id,
            view: row.view
        })
    }

    addHeader()

    return {
        view: tableView,
        add,
        set,
        get selectedId() {
            return selection ? selection.id : undefined
        }
    }
}
