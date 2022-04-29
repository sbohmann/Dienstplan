const fs = require('fs')
const bcrypt = require('bcrypt')
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

class StorageError extends Error {
    static USER_NAME_ALREADY_IN_USE = {}

    key

    constructor(message, key) {
        super(message)
        this.key = key
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

    let userForId
    let userIdForUserName

    function buildMaps() {
        userForId = new Map()
        for (const user of data.users) {
            if (userForId.has(user.id)) {
                throw RangeError("Duplicate user ID: " + user.id)
            }
            userForId.set(user.id, user)
        }

        userIdForUserName = new Map()
        for (const user of data.users) {
            if (userIdForUserName.has(user.name)) {
                throw RangeError("Duplicate user name: " + user.id)
            }
            userIdForUserName.set(user.name, user.id)
        }
    }

    buildMaps()

    function writeChanges(newData, postAction) {
        data = newData
        buildMaps()

        // TODO report back in case of both success and error - a pending and error state in the UI are required
        // TODO create a copy of data before writing, only update if successful
        writeFileAtomic(dataPath, JSON.stringify(newData))
            .then(_ => {
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

    function nextAvailableId() {
        for (let candidate = 1; candidate < (1 << 20); ++candidate) {
            if (!userForId.has(candidate)) {
                return candidate
            }
        }
    }

    return {
        // TODO do not expose, as it is mutable
        get data() { return data },
        get userForId() { return userForId },
        get userIdForUserName() { return userIdForUserName },
        add(year, month, day, context, id, modifiedByAdmin, request, postAction) {
            console.log('storage.js')
            console.log(modifiedByAdmin)
            const dayIndex = day - 1
            let currentEntry = data.years[year][month][dayIndex][context]
            if (currentEntry !== undefined) {
                throw RangeError("Attempting to add while ID present - current entru: " + JSON.stringify(currentEntry) +
                    ", request: " + request)
            }
            const newData = createCopyOfData()
            let user = userForId.get(id)
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
        },
        setPassword(userId, newPassword) {
            let user = userForId.get(userId)
            let newSalt = bcrypt.genSaltSync()
            const newHash = bcrypt.hashSync(newPassword, newSalt)
            user.salt = newSalt
            user.hash = newHash
            writeChanges(data)
        },
        addUser(user) {
            let existingIdForUserName = userIdForUserName.get(user.name)
            if (existingIdForUserName !== undefined) {
                throw new StorageError("failed to add user", StorageError.USER_NAME_ALREADY_IN_USE)
            }
            user.id = nextAvailableId()
            const newData = createCopyOfData()
            newData.users.push(user)
            writeChanges(newData)
            userForId.set(user.id, user)
        },
        updateUser(user) {
            let existingIdForUserName = userIdForUserName.get(user.name)
            if (existingIdForUserName !== undefined && existingIdForUserName !== user.id) {
                throw new StorageError("failed to update user", StorageError.USER_NAME_ALREADY_IN_USE)
            }
            let original = userForId.get(user.id)
            Object.assign(original, user)
            writeChanges(data)
        },
        StorageError
    }
}

module.exports = Storage()
