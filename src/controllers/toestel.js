Toestel = require('../models/toestel');

// Handle index actions
exports.index = function (req, res) {
    Toestel.get(function (err, Toestellen) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: true,
            message: "Toestellen opgehaald",
            data: Toestellen
        });
    });
};

exports.new = function (req, res) {
    var toestel = new Toestel();
    toestel.adres = req.body.adres;
    toestel.eigenaar = req.body.eigenaar;

    toestel.save(function (err) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            res.json({
                status: true,
                message: 'Nieuwe toestel gemaakt!',
                data: toestel
            });
        }
    });
};

exports.view = function (req, res) {
    Toestel.findById(req.params.toestel_id, function (err, Toestel) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            res.json({
                status: true,
                message: 'Toestel geladen',
                data: Toestel
            });
        }
    });
};

exports.update = function (req, res) {
    Toestel.findById(req.params.toestel_id, function (err, Toestel) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            Toestel.adres = req.body.adres;
            Toestel.eigenaar = req.body.eigenaar;
            Toestel.modified_date = Date.now();

            Toestel.save(function (err) {
                if (err) {
                    res.json(err);
                } else {
                    res.json({
                        status: true,
                        message: 'Toestel aangepast',
                        data: Toestel
                    });
                }
            });
        }
    });
};

exports.delete = function (req, res) {
    Toestel.deleteOne({
        _id: req.params.toestel_id
    }, function (err, Toestel) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            res.json({
                status: true,
                message: 'Toestel gewist'
            });
        }
    });
};

exports.viewScore = function (req, res) {

};

exports.newScore = function (req, res) {
    Toestel.findById(req.params.toestel_id, function (err, Toestel) {
        if (err) {
            res.json({
                status: false,
                message: err
            })
        } else {
            var score = {
                score: req.body.score,
                beschrijving: req.body.beschrijving
            };

            Toestel.scores.push(score);
            Toestel.score = parseInt(Toestel.score) + parseInt(req.body.score);
            Toestel.save(function (err) {
                if (err) {
                    res.json(err);
                } else {
                    res.json({
                        status: true,
                        message: 'Score toegevoegd',
                        data: Toestel
                    });
                }
            });
        }
    });
};