const bcrypt = require('bcrypt')
const crypto = require('crypto')
const storage = require('../storage/storage')

for (let user of storage.data.users) {
    if (!user.salt || user.hash) {
        const salt = bcrypt.genSaltSync()
        const password = Array.from(crypto.randomBytes(6))
            .map(value => {
                const low = value & 0xf
                const high = value >> 4
                let first = String.fromCharCode(97 + low)
                let second = String.fromCharCode(107 + high)
                const part = first + second
                return first + second
            })
            .join("")
        const hash = bcrypt.hashSync(password, salt)
        console.log("user ID: " + user.id)
        console.log("user name: " + user.name)
        console.log("salt: " + salt + "")
        console.log("password: " + password)
        console.log("hash: " + hash)
    }
}
