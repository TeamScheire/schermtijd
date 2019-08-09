var db = require("../database.js")
exports.viewScore = (req, res) => {

};

exports.newScore = (req, res) => {
    var errors = []
    if (!req.body.score) {
        errors.push("Vul een score in");
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
    var sql = 'INSERT INTO score (toestel_id, score, bericht, datum) VALUES (?,?,?, CURRENT_TIMESTAMP)'
    var params = [data.toestel_id, data.score, data.bericht]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({
                "error": err.message
            })
            return;
        }
        var sql = 'UPDATE toestel SET score = score + ? WHERE id = ?'
        var params = [data.score, req.params.toestel_id]
        db.run(sql, params, function (err, result) {
            res.json({
                status: true,
                message: 'Nieuwe score toegevoegd!',
                data: data,
                id: this.lastID
            })
        })
    });
};