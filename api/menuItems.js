const express = require('express')
const sqlite3 = require('sqlite3')
const { checkValidMenuItem, checkMenuExist} = require('./middleware')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const menuItemsRouter = express.Router({mergeParams:true});

menuItemsRouter.param('menuItemId', (req, res, next, id) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${Number(id)}`, (err, menuItem) => {
        if(err) {
            next(err)
        } else if(!menuItem){
            res.sendStatus(404)
        } else {
            req.menuItems = menuItem
            next()
        }
    })
})

menuItemsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
        $menuId: req.params.menuId
    }, (err, menuItems) => {
        if(err) {
            next(err)
        } else {
            res.status(200).json({menuItems})
        }
    })
})

menuItemsRouter.post('/', checkValidMenuItem, (req, res, next) => {
    const menuItem = req.body.menuItem
        db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)', {
            $name: menuItem.name,
            $description: menuItem.description,
            $inventory: menuItem.inventory,
            $price: menuItem.price,
            $menuId: req.params.menuId
        }, function (err) {
            if(err) {
                next(err)
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {
                    if(err) {
                        next(err)
                    } else {
                        res.status(201).json({menuItem})
                    }
                })
            }
        })

})

menuItemsRouter.put('/:menuItemId',   checkValidMenuItem, (req, res, next) => {
    const menuItem = req.body.menuItem
    db.run('UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id', {
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $menuId: req.params.menuId,
        $id: req.params.menuItemId
    }, function (err) {
        if(err) {
            next(err)
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, menuItem) => {
                if(err) {
                    next(err)
                } else {
                    res.status(200).json({menuItem})
                }
            })
        }
    })
})

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, function (err) {
        if(err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
})

module.exports = menuItemsRouter;