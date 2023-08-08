const express = require('express')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const employeesRouter = express.Router()

const checkValidEmployee = (req, res, next) => {
    const employee = req.body.employee
    if(!employee.name || !employee.position || !employee.wage) {
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

employeesRouter.param('employeeId', (req, res, next, id) => {
    db.get(`SELECT * FROM Employee WHERE id = ${Number(id)}`, (err, employee) => {
        if(err) {
            next(err)
        } else if(!employee) {
            res.sendStatus(404)
        } else {
            req.employee = employee
            next()
        }
    })
})

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
        if(err) {
            next(err)
        } else {
            res.status(200).json({employees})
        }
    })
})

employeesRouter.post('/', checkValidEmployee, (req, res, next) => {
    const employee = req.body.employee
    db.run('INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)', {
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage,
        $isCurrentEmployee: employee.isCurrentEmployee || 1
    }, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
                if(err) {
                    next(err)
                } else {
                    res.status(201).json({employee})
                }
            })
        }
    })
})

employeesRouter.get('/:employeeId', checkEmployeeExist, (req, res, next) => {
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
        if(err) {
            next(err)
        } else {
            res.status(200).json({employee})
        }
    })
})

employeesRouter.put('/:employeeId', checkEmployeeExist, checkValidEmployee, (req, res, next) => {
    const employee = req.body.employee
    db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id', {
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage,
        $isCurrentEmployee: employee.isCurrentEmployee || 1,
        $id: req.params.employeeId
    }, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
                if(err) {
                    next(err)
                } else {
                    res.status(200).json({employee})
                }
            })
        }
    })
})

employeesRouter.delete('/:employeeId', checkEmployeeExist, (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.employeeId}`, function(err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
                if(err) {
                    next(err)
                } else {
                    res.status(200).json({employee})
                }
            })
        }
    })
})

module.exports = employeesRouter;