function ListViewColumns(definition) {
    let result = new Map()
    for (let columnId in definition) {
        result.set(columnId, definition[columnId])
    }
    return result
}

function ListView(columns) {
    let view = document.createElement('table')
    let rows = []

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
        rows.push({
            id: rowData.id,
            view: row
        })
    }

    addHeader()

    return {
        view,
        add
    }
}
