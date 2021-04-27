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
    let state = {
        data: undefined
    }

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
        state.data = Data()
        fs.writeFileSync(dataPath, JSON.stringify(state.data), {flag: 'wx', encoding: 'UTF-8'})
    }

    function backupAndReadExistingData() {
        const destinationPath = 'history/data_' + new Date().toISOString() + '.json'
        console.log(dataPath + " is present, copying to [" + destinationPath + "]")
        if (!fs.existsSync(historyDirectory)) {
            fs.mkdirSync(historyDirectory)
        }
        state.data = JSON.parse(fs.readFileSync(dataPath, 'UTF-8'))
        fs.copyFileSync(dataPath, destinationPath, fs.constants.COPYFILE_EXCL)
    }

    initialize()

    const userForId = new Map()
    for (const user of state.data.users) {
        if (userForId.has(user.id)) {
            throw RangeError("Duplicate user ID: " + user.id)
        }
        userForId.set(user.id, user)
    }

    function writeChanges(newData, postAction) {
        // TODO report back in case of both success and error - a pending and error state in the UI are required
        // TODO create a copy of data before writing, only update if successful
        writeFileAtomic(dataPath, JSON.stringify(newData))
            .then(_ => {
                state.data = newData
                console.log("Changes successfully written")
                if (postAction) {
                    postAction()
                }
            })
            .catch(error => {
                console.error("Error writing changes: " + error)
                console.error(error.stack)
            })
    }

    function createCopyOfData() {
        // TODO find a smarter way to create a copy
        return JSON.parse(JSON.stringify(state.data));
    }

    return {
        state: state,
        userForId,
        add(year, month, day, context, id, request, postAction) {
            const dayIndex = day - 1
            let currentEntry = state.data.years[year][month][dayIndex][context]
            if (currentEntry !== undefined) {
                throw RangeError("Attempting to add while ID present - current entru: " + JSON.stringify(currentEntry) +
                    ", request: " + request)
            }
            const newData = createCopyOfData()
            newData.years[year][month][dayIndex][context] =
                {
                    id: id,
                    name: userForId.get(id).name
                }
            writeChanges(newData, postAction)
        },
        remove(year, month, day, context, id, request, postAction) {
            const dayIndex = day - 1
            let currentId = state.data.years[year][month][dayIndex][context].id
            if (currentId !== id) {
                throw RangeError("Attempting to remove non-matching ID - current: " + currentId +
                    ", request: " + request)
            }
            const newData = createCopyOfData()
            newData.years[year][month][dayIndex][context] = undefined
            writeChanges(newData, postAction)
        }
    }
}

module.exports = Storage()
