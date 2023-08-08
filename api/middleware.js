const express = require('express')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const checkValidEmployee = (req, res, next) => {
    const employee = req.body.employee
    if(!employee.name || !employee.position || !employee.wage) {
        res.sendStatus(400)
    } else {
        next()
    }
}

const checkValidTimesheet = (req, res, next) => {
    const timesheet = req.body.timesheet
    if(!timesheet.hours || !timesheet.rate || !timesheet.date) {
        res.sendStatus(400)
    } else {
        next()
    }
}

const checkEmployeeExist = (req, res, next) => {
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
        if(err) {
            next(err)
        } else if(!employee) {
            res.sendStatus(404)
        } else {
            next()
        }
    })
}

const checkValidMenu = (req, res, next) => {
    if(!req.body.menu.title) {
        res.sendStatus(400)
    } else {
        next()
    }
}


module.exports = {checkEmployeeExist,
    checkValidEmployee,
    checkValidTimesheet,
    checkValidMenu
}