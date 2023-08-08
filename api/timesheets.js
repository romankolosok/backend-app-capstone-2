const express = require('express')
const sqlite3 = require('sqlite3')
const {checkEmployeeExist, checkValidTimesheet} = require('./middleware')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const timesheetsRouter = express.Router({mergeParams:true});

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${id}`, (err, timesheet) => {
        if(err) {
            next(err)
        } else if(!timesheet) {
            res.sendStatus(404)
        } else {
            req.timesheet = timesheet
            next()
        }
    })
})

timesheetsRouter.get('/', checkEmployeeExist, (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, timesheets) => {
        if(err) {
            next(err)
        } else {
            res.status(200).json({timesheets})
        }
    })
})

timesheetsRouter.post('/', checkEmployeeExist, checkValidTimesheet, (req, res, next) => {
    const timesheet = req.body.timesheet
    db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)', {
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employeeId: req.params.employeeId
    }, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
                if(err) {
                    next(err)
                } else {
                    res.status(201).json({timesheet})
                }
            })
        }
    })
})

timesheetsRouter.put('/:timesheetId', checkEmployeeExist, checkValidTimesheet, (req, res, next) => {
    const timesheet = req.body.timesheet
    db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $id', {
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employeeId: req.params.employeeId,
        $id: req.params.timesheetId
    }, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, timesheet) => {
                if(err) {
                    next(err)
                } else {
                    res.status(200).json({timesheet})
                }
            })
        }
    })
})

timesheetsRouter.delete('/:timesheetId', checkEmployeeExist, (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, function (err) {
        if(err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
})

module.exports = timesheetsRouter;
