require('dotenv').load()
// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
const createError = require('http-errors')
import express from 'express'
const cookieParser = require('cookie-parser')
const logger = require('morgan')
import helmet from 'helmet'

const app: express.Application = express()

app.use(helmet())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// ROUTES
app.use('/', require('./modules/index'))

// catch 404 and forward to error handler
app.use(function(req: express.Request, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err: any, req: express.Request, res: express.Response) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({
    status: err.status,
    message: "Une erreur s'est produite !"
  })
})

module.exports = app;
