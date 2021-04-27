const fs = require('fs')
const writeFileAtomic = require('write-file-atomic')

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

    function writeChanges() {
        writeFileAtomic(dataPath, JSON.stringify(data))
            .then(_ => console.log("Changes successfully written"))
            .catch(error => {
                console.error("Error writing changes: " + error)
                console.error(error.stack)
            })
    }

    return {
        data,
        userForId,
        add(year, month, day, context, id, request) {
            const dayIndex = day - 1
            let currentEntry = data.years[year][month][dayIndex][context]
            if (currentEntry !== undefined) {
                throw RangeError("Attempting to add while ID present - current entru: " + JSON.stringify(currentEntry) +
                    ", request: " + request)
            }
            data.years[year][month][dayIndex][context] =
                {
                    id: id,
                    name: userForId.get(id).name
                }
            writeChanges()
        },
        remove(year, month, day, context, id, request) {
            const dayIndex = day - 1
            let currentId = data.years[year][month][dayIndex][context].id
            if (currentId !== id) {
                throw RangeError("Attempting to remove non-matching ID - current: " + currentId +
                    ", request: " + request)
            }
            data.years[year][month][dayIndex][context] = undefined
            writeChanges()
        }
    }
}

module.exports = Storage()
