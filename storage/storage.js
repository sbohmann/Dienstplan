const fs = require('fs')
const bcrypt = require('bcrypt')
const writeFileAtomic = require('write-file-atomic')

const relevantMonth = require('./relevantMonth')

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
    static USER_NAME_ALREADY_IN_USE = {error: "User name already in use"}
    static ILLEGAL_USER_NAME = {error: "User name too long"}

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
        backupData()
        data = JSON.parse(fs.readFileSync(dataPath, 'UTF-8'))
    }

    function backupData() {
        // TODO use path.join
        const destinationPath = 'history/data_' + new Date().toISOString() + '.json'
        console.log(dataPath + " is present, copying to [" + destinationPath + "]")
        if (!fs.existsSync(historyDirectory)) {
            fs.mkdirSync(historyDirectory)
        }
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

        backupData()

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

    function checkWhetherMonthIsEditable(year, month, admin) {
        if (admin) {
            return
        }
        const candidate = relevantMonth()
        if (year === candidate.year
            && month === candidate.month
            && candidate.editable === true) {
            return
        }
        throw new RangeError('Attempt by user ' + id + ' to edit year ' + year + ', month ' + month)
    }

    return {
        // TODO do not expose, as it is mutable, but a deep copy would cause a massive overhead
        get data() {
            return data
        },
        get userForId() {
            return userForId
        },
        get userIdForUserName() {
            return userIdForUserName
        },
        add(admin, year, month, day, context, id, modifiedByAdmin, request, postAction) {
            checkWhetherMonthIsEditable(year, month, admin)
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
        remove(admin, year, month, day, context, id, request, postAction) {
            checkWhetherMonthIsEditable(year, month, admin)
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
        setPassword(userId, newPassword, provisional) {
            let user = userForId.get(userId)
            let newSalt = bcrypt.genSaltSync(10)
            const newHash = bcrypt.hashSync(newPassword, newSalt)
            user.salt = newSalt
            user.hash = newHash
            user.passwordChangeRequired = provisional
            writeChanges(data)
        },
        addUser(user) {
            if (!userNameValid(user)) {
                throw new StorageError("failed to add user", StorageError.ILLEGAL_USER_NAME)
            }
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
            if (!userNameValid(user)) {
                throw new StorageError("failed to add user", StorageError.ILLEGAL_USER_NAME)
            }
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

function userNameValid(user) {
    if (user.name.length > 64) {
        return false
    }
    for (let c of user.name) {
        if (c.codePointAt(0) < 0x20) {
            return false
        }
    }
    return true
}

module.exports = Storage()
