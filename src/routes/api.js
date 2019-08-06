let router = require('express').Router(); 

// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'De api werkt!',
        message: 'proficiat :)',
    });
});

// Import contact controller
var activiteitController = require('../controllers/activiteit');

// Contact routes
router.route('/activiteit')
    .get(activiteitController.index)
    .post(activiteitController.new);
    
router.route('/activiteit/:activiteit_id')
    .get(activiteitController.view)
    .patch(activiteitController.update)
    .put(activiteitController.update)
    .delete(activiteitController.delete);

// Export API routes
module.exports = router;