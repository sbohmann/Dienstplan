let monthData
let users
let year
let month
let userId
let userIsAdmin
let userName

function markAsAdminBooking(booking) {
    if (booking.modifiedByAdmin) {
        let ignoreAdministrationBooking = userIsAdmin && booking.id === userId
        return !ignoreAdministrationBooking
    }
    return false
}
