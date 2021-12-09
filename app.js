const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const dataRouter = require('./routes/data')
const loginRouter = require('./routes/login')
const logoutRouter = require('./routes/logout')
const menuRouter = require('./routes/menu')
const passwordRouter = require('./routes/password')
const pdfRouter = require('./routes/pdf')

const storage = require('./storage/storage')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: storage.data.sessionSecret,
    name: 'sessionId'
}))

app.use('/login', loginRouter)

app.use(function (request, response, next) {
    let userId = request.session.userId
    if (userId === undefined) {
        if (request.method === 'GET') {
            response.status(302)
            response.set('Location', '/login')
            response.send()
        } else {
            response.status(401)
            response.send()
        }
    } else {
        next()
    }
})

app.use('/', indexRouter)
app.use('/data', dataRouter)
app.use('/logout', logoutRouter)
app.use('/menu', menuRouter)
app.use('/password', passwordRouter)
app.use('/pdf', pdfRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
app.use(function (err, req, res) {
    console.error(err)
    console.error(err.stack)

    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.path = req.path
    res.locals.method = req.method
    res.locals.error = process.env.NODE_ENV === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
