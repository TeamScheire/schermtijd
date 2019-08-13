var db = require("../database.js")

exports.index = (req, res) => {
    var sql = "SELECT * FROM toestel"
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

exports.new = (req, res) => {
    var errors = []
    if (!req.body.adres) {
        errors.push("Vul een adres in");
    }
    if (errors.length) {
        res.json({
            status: false,
            message: errors
        });
        return;
    }
    var data = {
        adres: req.body.adres,
        eigenaar: req.body.eigenaar,
        score: 0
    }
    var sql = 'INSERT INTO toestel (adres, eigenaar, score) VALUES (?,?,?)'
    var params = [data.adres, data.eigenaar, data.score]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({
                "error": err.message
            })
            return;
        }
        res.json({
            status: true,
            message: 'Nieuw toestel gemaakt!',
            data: data,
            id: this.lastID
        })
    });
};

exports.view = (req, res) => {
    var sql = "SELECT * FROM toestel WHERE id = ?"
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
            message: 'Toestel geladen',
            data: row
        })
    });
};

exports.update = (req, res) => {
    var data = {
        adres: req.body.adres,
        eigenaar: req.body.eigenaar
    }
    db.run(
        `UPDATE toestel set 
           adres = COALESCE(?,adres), 
           eigenaar = COALESCE(?,eigenaar) 
           WHERE id = ?`,
        [data.adres, data.eigenaar, req.params.id],
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
                message: 'toestel aangepast',
                data: data,
                changes: this.changes
            })
        }
    );
};

exports.delete = (req, res) => {
    db.run(
        'DELETE FROM toestel WHERE id = ?',
        req.params.score_id,
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
                message: 'Toestel gewist'
            });
        }
    );
};