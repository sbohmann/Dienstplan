const fs = require('fs')

let dataPath = 'data.json'
let historyDirectory = 'history'

function Data() {
    return {
        users: [],
        years: []
    }
}

function Storage() {
    let data

    function initialize() {
        readOrCreateData()
    }

    function readOrCreateData() {
        if (!fs.existsSync(dataPath)) {
            createInitialData()
        } else {
            backupAndReadExistingData()
        }
    }

    function createInitialData() {
        console.log(dataPath + " is missing, creating initial empty data.")
        data = Data()
        fs.writeFileSync(dataPath, JSON.stringify(data), {flag: 'wx', encoding: 'UTF-8'})
    }

    function backupAndReadExistingData() {
        const destinationPath = 'history/data_' + new Date().toISOString() + '.json'
        console.log(dataPath + " is present, copying to [" + destinationPath + "]")
        if (!fs.existsSync(historyDirectory)) {
            fs.mkdirSync(historyDirectory)
        }
        data = JSON.parse(fs.readFileSync(dataPath, 'UTF-8'))
        fs.copyFileSync(dataPath, destinationPath, fs.constants.COPYFILE_EXCL)
    }

    initialize()

    const userForId = new Map()
    for (const user of data.users) {
        if (userForId.has(user.id)) {
            throw RangeError("Duplicate user ID: " + user.id)
        }
        userForId.set(user.id, user)
    }

    return {
        data,
        userForId
    }
}

module.exports = Storage()
