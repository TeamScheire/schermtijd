Activiteit = require('../models/activiteit');

// Handle index actions
exports.index = function (req, res) {
    Activiteit.get(function (err, Activiteiten) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: true,
            message: "Activiteiten opgehaald",
            data: Activiteiten
        });
    });
};

exports.new = function (req, res) {
    var activiteit = new Activiteit();
    activiteit.titel = req.body.titel;
    activiteit.beschrijving = req.body.beschrijving;
    activiteit.materiaal = req.body.materiaal;

    activiteit.save(function (err) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            res.json({
                status: true,
                message: 'Nieuwe activiteit gemaakt!',
                data: activiteit
            });
        }
    });
};

exports.view = function (req, res) {
    Activiteit.findById(req.params.activiteit_id, function (err, Activiteit) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            res.json({
                status: true,
                message: 'Activiteit geladen',
                data: Activiteit
            });
        }
    });
};

exports.update = function (req, res) {
    Activiteit.findById(req.params.activiteit_id, function (err, Activiteit) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            Activiteit.titel = req.body.titel;
            Activiteit.beschrijving = req.body.beschrijving;
            Activiteit.materiaal = req.body.materiaal;
            Activiteit.modified_date = Date.now();

            Activiteit.save(function (err) {
                if (err) {
                    res.json(err);
                } else {
                    res.json({
                        status: true,
                        message: 'Activiteit aangepast',
                        data: Activiteit
                    });
                }
            });
        }
    });
};

exports.delete = function (req, res) {
    Activiteit.deleteOne({
        _id: req.params.activiteit_id
    }, function (err, Activiteit) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            res.json({
                status: true,
                message: 'Activiteit gewist'
            });
        }
    });
};