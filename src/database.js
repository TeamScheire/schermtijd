var path = require('path')
var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = path.join(__dirname, "schermtijd.sqlite3")

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')

        db.run(`CREATE TABLE IF NOT EXISTS activiteit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titel text, 
            beschrijving text, 
            locatie text,
            tijdstip text,
            aantal_min INTEGER,
            aantal_max INTEGER,
            materiaal text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM activiteit`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO activiteit (titel, beschrijving, aantal_min, aantal_max) VALUES (?,?,?,?)'
                    db.run(insert, ["Gras afrijden", "Ga naar buiten en rij het gras af!", 1, 1])
                    db.run(insert, ["Kamer opruimen", "Ga naar boven en ruim je kamer op", 1, 2])
                    console.log('dummy activiteiten toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS toestel (
            id INTEGER PRIMARY KEY,
            avatar image,
            adres text,
            eigenaar text,
            score text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM toestel`, (err, rows) => {
                if ((rows) && (rows[0].aantal == 0)) {
                    var insert = 'INSERT INTO toestel (id, avatar, adres, eigenaar, score) VALUES (?, ?, ?, ?, 0)'
                    for (i = 1; i <= 4; i++) {
                        db.run(insert, [i,'./avatar/avatar' + i + '.jpg', i, "Slot " + i])
                    }
                    console.log('toestellen toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS tijdslot (
            id INTEGER PRIMARY KEY,
            startuur INTEGER,
            gewicht INTEGER
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM tijdslot`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO tijdslot (id, startuur, gewicht) VALUES (?, ?, ?)'
                    for (i = 1; i <= 24; i++) {

                        db.run(insert, [i, i, 3])
                    }
                    console.log('tijdslots toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS score (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            toestel_id INTEGER,
            score text,
            bericht text,
            datum INTEGER
            )`);
    }
});


module.exports = db