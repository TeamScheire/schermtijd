var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "./schermtijd.sqlite3"

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
                    var insert = 'INSERT INTO activiteit (titel, beschrijving) VALUES (?,?)'
                    db.run(insert, ["Gras afrijden", "Ga naar buiten en rij het gras af!"])
                    db.run(insert, ["Kamer opruimen", "Ga naar boven en ruim je kamer op"])
                    console.log('dummy activiteiten toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS toestel (
            id INTEGER PRIMARY KEY,
            adres text,
            eigenaar text,
            score text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM toestel`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO toestel (id, adres, eigenaar, score) VALUES (?, ?, ?, 0)'
                    db.run(insert, ["1", "1", "Jan"])
                    db.run(insert, ["2", "2", "Piet"])
                    db.run(insert, ["3", "3", "Joris"])
                    db.run(insert, ["4", "4", "Korneel"])
                    db.run(insert, ["5", "5", "Vriendje"])
                    db.run(insert, ["6", "6", "Vriendinneke"])
                    console.log('dummy toestellen toegevoegd')
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