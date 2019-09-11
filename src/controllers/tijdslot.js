var db = require("../database.js")

exports.index = (req, res) => {
    var sql = "SELECT * FROM tijdslot ORDER BY startuur"
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

exports.update = (req, res) => {
    var data = {
        gewicht: req.body.gewicht
    }
    db.run(
        `UPDATE tijdslot set 
           gewicht = COALESCE(?,gewicht) 
           WHERE id = ?`,
        [data.gewicht, req.params.id],
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
                message: 'tijdslot aangepast',
                data: data,
                changes: this.changes
            })
        }
    );
};

exports.currentWeight = (req, res) => {
    var errors = []
    if (!req.params.startuur) {
        errors.push("Geef een startuur door");
    }
    if (errors.length) {
        res.json({
            status: false,
            message: errors
        });
        return;
    }
    var sql = "SELECT * FROM tijdslot WHERE startuur = ?"
    var params = [req.params.startuur];
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
            data: rows[0]
        })
    });

}