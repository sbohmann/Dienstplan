function setMultilineTextContent(element, lines) {
    if (typeof lines === "string") {
        lines = [lines]
    }
    removeContent(element)
    let first = true
    for (let line of lines) {
        if (!first) {
            element.appendChild(document.createElement('br'))
        }
        element.appendChild(document.createTextNode(line))
        first = false
    }
}

function removeContent(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild)
    }
}
