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
            status: "success",
            message: "Activiteiten opgehaald",
            data: Activiteiten
        });
    });
};

exports.new = function (req, res) {
    var activiteit = new Activiteit();
    activiteit.titel = req.body.titel ? req.body.titel : activiteit.titel;
    activiteit.beschrijving = req.body.beschrijving;
    activiteit.materiaal = req.body.materiaal;

    activiteit.save(function (err) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'Nieuwe activiteit gemaakt!',
                data: activiteit
            });
        }
    });
};

exports.view = function (req, res) {
    Activiteit.findById(req.params.activiteit_id, function (err, Activiteit) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'Activiteit geladen',
                data: Activiteit
            });
        }
    });
};

exports.update = function (req, res) {
    Activiteit.findById(req.params.activiteit_id, function (err, Activiteit) {
        if (err) {
            res.send(err);
        } else {
            Activiteit.titel = req.body.titel ? req.body.titel : Activiteit.titel;
            Activiteit.beschrijving = req.body.beschrijving;
            Activiteit.materiaal = req.body.materiaal;
            Activiteit.modified_date = Date.now;

            Activiteit.save(function (err) {
                if (err) {

                    res.json(err);
                } else {
                    res.json({
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
            res.send(err);
        } else {
            res.json({
                status: "success",
                message: 'Activiteit gewist'
            });
        }
    });
};