var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "schermtijd.sqlite3"

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
            materiaal text,
            locatie INTEGER,
            tijdstip INTEGER,
            aantal_min INTEGER,
            aantel_max INTEGER
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM activiteit`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO activiteit (titel, beschrijving) VALUES (?,?)'
                    db.run(insert, ["Gras afrijden", "Ga naar buiten en rij het gras af"])
                    db.run(insert, ["Kamer opruimen", "Ga naar boven en ruim je kamer op"])
                    console.log('dummy activiteiten toegevoegd')
                }
            })
        });
        db.run(`CREATE TABLE IF NOT EXISTS toestel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            adres text,
            eigenaar text,
            score text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM toestel`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO toestel (adres, eigenaar, score) VALUES (?,?,0)'
                    db.run(insert, ["pos01", "Jan"])
                    db.run(insert, ["pos02", "Piet"])
                    db.run(insert, ["pos03", "Joris"])
                    db.run(insert, ["pos04", "Korneel"])
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
        db.run(`CREATE TABLE IF NOT EXISTS tijdstip (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tijdstip text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM tijdstip`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    var insert = 'INSERT INTO tijdstip (tijdstip) VALUES (?)'
                    db.run(insert, ["overdag"])
                    db.run(insert, ["'s avonds'"])
                    db.run(insert, ["altijd"])
                    console.log('tijdstippen toegevoegd')
                }
            });
        });
        db.run(`CREATE TABLE IF NOT EXISTS locatie (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locatie text
            )`, (err, rows) => {
            db.all(`SELECT COUNT() AS aantal FROM locatie`, (err, rows) => {
                if (rows[0].aantal == 0) {
                    insert = 'INSERT INTO locatie (locatie) VALUES (?)'
                    db.run(insert, ["binnen"])
                    db.run(insert, ["buiten"])
                    db.run(insert, ["overal"])
                    console.log('locaties toegevoegd')
                }
            });
        });
    }
});

module.exports = db