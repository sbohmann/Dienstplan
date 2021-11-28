const fs = require('fs')
const writeFileAtomic = require('write-file-atomic')

let dataPath = 'data.json'
let historyDirectory = 'history'

function Data() {
    return {
        sessionSecret: "",
        users: [],
        years: []
    }
}

function Storage() {
    let data = undefined

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

    const userIdForUserName = new Map()
    for (const user of data.users) {
        if (userIdForUserName.has(user.name)) {
            throw RangeError("Duplicate user name: " + user.id)
        }
        userIdForUserName.set(user.name, user.id)
    }

    function writeChanges(newData, postAction) {
        // TODO report back in case of both success and error - a pending and error state in the UI are required
        // TODO create a copy of data before writing, only update if successful
        writeFileAtomic(dataPath, JSON.stringify(newData))
            .then(_ => {
                data = newData
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
        return JSON.parse(JSON.stringify(data));
    }

    return {
        get data() { return data },
        get userForId() { return userForId },
        get userIdForUserName() { return userIdForUserName },
        add(year, month, day, context, id, request, modifiedByAdmin, postAction) {
            const dayIndex = day - 1
            let currentEntry = data.years[year][month][dayIndex][context]
            if (currentEntry !== undefined) {
                throw RangeError("Attempting to add while ID present - current entru: " + JSON.stringify(currentEntry) +
                    ", request: " + request)
            }
            const newData = createCopyOfData()
            let user = userForId.get(id)
            console.log(user)
            newData.years[year][month][dayIndex][context] =
                {
                    id: id,
                    name: user.name,
                    modifiedByAdmin: modifiedByAdmin
                }
            writeChanges(newData, postAction)
        },
        remove(year, month, day, context, id, request, postAction) {
            const dayIndex = day - 1
            let currentId = data.years[year][month][dayIndex][context].id
            if (currentId !== id) {
                throw RangeError("Attempting to remove non-matching ID - current: " + currentId +
                    ", request: " + request)
            }
            const newData = createCopyOfData()
            newData.years[year][month][dayIndex][context] = undefined
            writeChanges(newData, postAction)
        },
        writeData(postAction) {
            writeChanges(data, postAction)
        }
    }
}

module.exports = Storage()
