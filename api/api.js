const express = require('express')
const sqlite3 = require('sqlite3')
const employeesRouter = require("./employees");

const apiRouter = express.Router()

apiRouter.use('/employees', employeesRouter)

module.exports = apiRouter;