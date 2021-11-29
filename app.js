const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const dataRouter = require('./routes/data')
const loginRouter = require('./routes/login')
const menuRouter = require('./routes/menu')
const passwordRouter = require('./routes/password')

const storage = require('./storage/storage')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: storage.data.sessionSecret,
  name: 'sessionId'
}))

app.use('/', indexRouter)
app.use('/data', dataRouter)
app.use('/login', loginRouter)
app.use('/menu', menuRouter)
app.use('/password', passwordRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  console.error(err)
  console.error(err.stack)

  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
