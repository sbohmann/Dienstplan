function ListViewColumns(definition) {
    let result = new Map()
    for (let columnId in definition) {
        result.set(columnId, definition[columnId])
    }
    return result
}

function ListView(columns) {
    let view = document.createElement('table')
    let rows = new Map()
    let selection = undefined

    function addHeader() {
        let header = document.createElement('th')
        for (let [, value] of columns.entries()) {
            let column = document.createElement('td')
            column.appendChild(document.createTextNode(value))
            header.appendChild(column)
        }
        view.appendChild(header)
    }

    function add(rowData) {
        let row = document.createElement('tr')
        for (let id of columns.keys()) {
            let column = document.createElement('td')
            column.appendChild(document.createTextNode(rowData[id].toString()))
            row.appendChild(column)
        }
        view.appendChild(row)
        view.onclick = () => {
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
        if (rowData.id !== undefined && rowData.id !== null) {
            rows.set(rowData.id, {
                id: rowData.id,
                view: row
            })
        }
    }

    addHeader()

    return {
        view,
        add
    }
}
