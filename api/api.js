const express = require('express')
const sqlite3 = require('sqlite3')
const employeesRouter = require("./employees");
const menusRouter = require('./menus')

const apiRouter = express.Router()

apiRouter.use('/employees', employeesRouter)
apiRouter.use('/menus', menusRouter)

module.exports = apiRouter;