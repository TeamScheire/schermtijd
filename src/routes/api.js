let router = require('express').Router();

// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'De api werkt!',
        message: 'proficiat :)',
    });
});

// controllers
var activiteitController = require('../controllers/activiteit');

router.route('/activiteit')
    .get(activiteitController.index)
    .post(activiteitController.new);

router.route('/activiteit/getRandom/:aantal_personen')
    .get(activiteitController.getRandom);

router.route('/activiteit/:id')
    .get(activiteitController.view)
    .patch(activiteitController.update)
    .put(activiteitController.update)
    .delete(activiteitController.delete)


var toestelController = require('../controllers/toestel');

router.route('/toestel')
    .get(toestelController.index)
    .post(toestelController.new);

router.route('/toestel/:id')
    .get(toestelController.view)
    .patch(toestelController.update)
    .put(toestelController.update)
    .delete(toestelController.delete);


var scoreController = require('../controllers/score');

router.route('/toestel/:toestel_id/score')
    .get(scoreController.viewScore)
    .post(scoreController.newScore);

router.route('/toestel/:toestel_id/score/:score_id')
    .delete(scoreController.delete);

var tijdslotController = require('../controllers/tijdslot');

router.route('/tijdslot')
    .get(tijdslotController.index);

router.route('/tijdslot/:id')
    .patch(tijdslotController.update)
    .put(tijdslotController.update);

var uploadController = require('../controllers/upload');

router.route('/toestel/uploadavatar')
    .post(uploadController.upload);

router.route('/toestel/:id/updateavatar')
    .post(toestelController.updateAvatar)


module.exports = router;