const userAdministrationActions = (function() {
    let result = {}
    for (let value of ['passwordReset']) {
        result[value] = value
    }
    Object.freeze(result)
    return result
}())

if (module.exports !== undefined) {
    module.exports = userAdministrationActions
}
