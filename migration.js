const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS Employee')
    db.run(`CREATE TABLE IF NOT EXISTS Employee (
id INTEGER PRIMARY KEY NOT NULL,
name TEXT NOT NULL,
position TEXT NOT NULL,
wage INTEGER NOT NULL,
is_current_employee INTEGER DEFAULT 1
)`)
})