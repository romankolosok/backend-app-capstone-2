const express = require('express')
const sqlite3 = require('sqlite3')
const { checkValidMenuItem, checkMenuExist} = require('./middleware')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const menuItemsRouter = express.Router({mergeParams:true});

menuItemsRouter.get('/', checkMenuExist, (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, menuItems) => {
        if(err) {
            next(err)
        } else {
            res.status(200).json({menuItems})
        }
    })
})

menuItemsRouter.post('/', checkMenuExist, checkValidMenuItem, (req, res, next) => {
    const menuItem = req.body.menuItem
    db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)', {
        $name: menuItem.name,
        $description: menuItem.description?menuItem.description:null,
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

module.exports = menuItemsRouter;