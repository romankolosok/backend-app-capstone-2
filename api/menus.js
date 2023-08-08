const express = require('express')
const sqlite3 = require('sqlite3')
const {checkValidMenu} = require('./middleware')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const menusRouter = express.Router()

menusRouter.param('menuId', (req, res, next, id) => {
    db.get(`SELECT * FROM Menu WHERE id = ${Number(id)}`, (err, menu) => {
        if(err) {
            next(err)
        } else if(!menu) {
            res.sendStatus(404)
        } else {
            req.menu = menu
            next()
        }
    })
})

menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        if(err) {
            next(err)
        } else {
            res.status(200).json({menus})
        }
    })
})

menusRouter.post('/', checkValidMenu, (req, res, next) => {
    const menu = req.body.menu
    db.run('INSERT INTO Menu (title) VALUES ($title)', {
        $title: menu.title
    }, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
                if(err) {
                    next(err)
                } else {
                    res.status(201).json({menu})
                }
            })
        }
    })
})

menusRouter.get('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
        if(err) {
            next(err)
        } else {
            res.status(200).json({menu})
        }
    })
})

menusRouter.put('/:menuId', checkValidMenu, (req, res, next) => {
    const menu = req.body.menu
    db.run('UPDATE Menu SET title = $title WHERE id = $id', {
        $title: menu.title,
        $id: req.params.menuId
    }, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
                if(err) {
                    next(err)
                } else {
                    res.status(200).json({menu})
                }
            })
        }
    })
})

menusRouter.delete('/:menuId', (req, res, next) => {
    db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, function (err) {
        if(err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
})


module.exports = menusRouter;
