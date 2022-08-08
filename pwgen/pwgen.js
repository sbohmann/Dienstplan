const bcrypt = require('bcrypt')
const crypto = require('crypto')
const storage = require('../storage/storage')

let overwrite = false

function passwordMissing(user) {
    return !user.salt || !user.hash
}

for (let user of storage.data.users) {
    if (passwordMissing(user) || overwrite) {
        const salt = bcrypt.genSaltSync(10)
        const password = Array.from(crypto.randomBytes(6))
            .map(value => {
                const low = value & 0xf
                const high = value >> 4
                let first = String.fromCharCode(97 + low)
                let second = String.fromCharCode(107 + high)
                return first + second
            })
            .join("")
        const hash = bcrypt.hashSync(password, salt)
        console.log("user ID: " + user.id)
        console.log("user name: " + user.name)
        console.log("salt: " + salt)
        console.log("password: " + password)
        console.log("hash: " + hash)
        user.salt = salt
        user.hash = hash
    }
}

storage.writeData(() => console.log("User data updated."))
