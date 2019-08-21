var db = require("../database.js")

exports.index = (req, res) => {
    var sql = "SELECT * FROM activiteit"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            status: true,
            message: "success",
            data: rows
        })
    });
};

exports.view = (req, res) => {
    var sql = "SELECT * FROM activiteit WHERE id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            status: true,
            message: 'Activiteit geladen',
            data: row
        })
    });
};

exports.getRandom = (req, res) => {
    // TODO Selectie verfijnen op uur en weer
    var sql = "SELECT * FROM activiteit WHERE aantal_min <= ? AND aantal_max >= ?"
    var params = [req.params.aantal_personen, req.params.aantal_personen]
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        row = rows[Math.floor(Math.random() * rows.length)];
        console.log(row);
        res.json({
            status: true,
            message: 'Activiteit opgehaald',
            data: row
        })
    });
};

exports.getRandomActiviteit = (aantal_personen, callback) => {
    // TODO Selectie verfijnen op uur en weer
    var sql = "SELECT * FROM activiteit WHERE aantal_min <= ? AND aantal_max >= ?"
    var params = [aantal_personen, aantal_personen]
    db.all(sql, params, (err, rows) => {
        row = rows[Math.floor(Math.random() * rows.length)];
        callback(row);
    });
};

exports.new = (req, res) => {
    var errors = []
    if (!req.body.titel) {
        errors.push("Vul een titel in");
    }
    if (!req.body.beschrijving) {
        errors.push("Vul een beschrijving in");
    }
    if (errors.length) {
        res.json({
            status: false,
            message: errors
        });
        return;
    }
    var data = {
        titel: req.body.titel,
        beschrijving: req.body.beschrijving,
        aantal_min: req.body.aantal_min,
        aantal_max: req.body.aantal_max,
        locatie: req.body.locatie,
        tijdstip: req.body.tijdstip,
        materiaal: req.body.materiaal
    }
    var sql = 'INSERT INTO activiteit (titel, beschrijving, aantal_min, aantal_max, locatie, tijdstip, materiaal) VALUES (?, ?, ?, ?, ?, ?, ?)'
    var params = [data.titel, data.beschrijving, data.aantal_min, data.aantal_max, data.locatie, data.tijdstip, data.materiaal]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({
                "error": err.message
            })
            return;
        }
        res.json({
            status: true,
            message: 'Nieuwe activiteit gemaakt!',
            data: data,
            id: this.lastID
        })
    });
};

exports.update = (req, res) => {
    var data = {
        titel: req.body.titel,
        beschrijving: req.body.beschrijving,
        aantal_min: req.body.aantal_min,
        aantal_max: req.body.aantal_max,
        locatie: req.body.locatie,
        tijdstip: req.body.tijdstip,
        materiaal: req.body.materiaal
    }
    db.run(
        `UPDATE activiteit set 
           titel = COALESCE(?,titel), 
           beschrijving = COALESCE(?,beschrijving), 
           aantal_min = COALESCE(?,aantal_min),
           aantal_max = COALESCE(?,aantal_max),
           locatie = COALESCE(?,locatie),
           tijdstip = COALESCE(?,tijdstip),
           materiaal = COALESCE(?,materiaal) 
           WHERE id = ?`,
        [data.titel, data.beschrijving, data.aantal_min, data.aantal_max, data.locatie, data.tijdstip, data.materiaal, req.params.id],
        function (err, result) {
            if (err) {
                res.json({
                    status: false,
                    message: err
                })
                return;
            }
            res.json({
                status: true,
                message: 'Activiteit aangepast',
                data: data,
                changes: this.changes
            })
        }
    );
};

exports.delete = (req, res) => {
    db.run(
        'DELETE FROM activiteit WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.json({
                    status: false,
                    message: err
                })
                return;
            }
            res.json({
                status: true,
                message: 'Activiteit gewist'
            });
        }
    );
};