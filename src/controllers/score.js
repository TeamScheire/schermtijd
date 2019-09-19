var db = require("../database.js")

exports.viewScore = (req, res) => {
    var errors = []
    if (!req.params.toestel_id) {
        errors.push("Geef een toestel door");
    }
    if (errors.length) {
        res.json({
            status: false,
            message: errors
        });
        return;
    }
    var sql = "SELECT * FROM score WHERE toestel_id = ? ORDER BY datum DESC"
    var params = [req.params.toestel_id]
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

exports.newScore = (req, res) => {
    var errors = []
    if (!req.body.score) {
        errors.push("Vul een score in");
    }
    if (req.body.score != parseInt(req.body.score, 10)) {
        errors.push("Vul een correcte score in");
    }
    if (!req.body.bericht) {
        errors.push("Vul een bericht in");
    }
    if (errors.length) {
        res.json({
            status: false,
            message: errors
        });
        return;
    }
    var data = {
        toestel_id: req.params.toestel_id,
        score: req.body.score,
        bericht: req.body.bericht
    }
    var sql = 'INSERT INTO score (toestel_id, score, bericht, datum) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    var params = [data.toestel_id, data.score, data.bericht]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({
                "error": err.message
            })
            return;
        }
        var sql = 'UPDATE toestel SET score = score + ? WHERE id = ?'
        var params = [data.score, data.toestel_id]
        db.run(sql, params, function (err, result) {
            res.json({
                status: true,
                message: 'Nieuwe score toegevoegd!'
            })
        })
    });
};

exports.delete = (req, res) => {
    db.run(
        'DELETE FROM score WHERE id = ?',
        (req.params.score_id),
        function (err, result) {
            if (err) {
                res.json({
                    status: false,
                    message: err
                })
                return;
            }
            var sql = "SELECT SUM(score) AS totaalscore FROM score WHERE toestel_id = ?";
            var params = [req.params.toestel_id];
            db.all(sql, params, (err, rows) => {
                var totaalscore = (rows[0].totaalscore) ? rows[0].totaalscore : 0;
                var sql = 'UPDATE toestel SET score = ? WHERE id = ?';
                var params = [totaalscore, req.params.toestel_id]
                db.run(sql, params, function (err, result) {
                    res.json({
                        status: true,
                        message: 'Score gewist'
                    })
                });
            });
        }
    );
};