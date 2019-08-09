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
            leeftijd INTEGER,
            tijdstip INTEGER,
            aantal_min INTEGER,
            aantel_max INTEGER
            )`,
            (err) => {
                if (err) {
                    console.log('Problemen met het aanmaken van tabel activiteit')
                } else {
                    /*
                    // Table just created, creating some rows
                    var insert = 'INSERT INTO activiteit (titel, beschrijving) VALUES (?,?)'
                    db.run(insert, ["Gras afrijden", "Ga naar buiten en rij het gras af"])
                    db.run(insert, ["Kamer opruimen", "Ga naar boven en ruim je kamer op"])
                    */
                }
            });
        db.run(`CREATE TABLE IF NOT EXISTS toestel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            adres text,
            eigenaar text,
            score text
            )`);
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