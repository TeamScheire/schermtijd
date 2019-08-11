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

router.route('/activiteit/:id')
    .get(activiteitController.view)
    .patch(activiteitController.update)
    .put(activiteitController.update)
    .delete(activiteitController.delete)


var toestelController = require('../controllers/toestel');

router.route('/toestel')
    .get(toestelController.index)
    .post(toestelController.new);

router.route('/toestel/:toestel_id')
    .get(toestelController.view)
    .patch(toestelController.update)
    .put(toestelController.update)
    .delete(toestelController.delete);


var toestelController = require('../controllers/score');

router.route('/toestel/:toestel_id/score')
    .get(toestelController.viewScore)
    .post(toestelController.newScore)


module.exports = router;