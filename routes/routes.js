const express = require('express'); // Import express
const router = express.Router(); // Use express router object

// Import the required controllers
const autocorrect_controller = require('../controllers/autocorrect.controller');

// Autocorrect POST handler
router.post('/autocorrect', autocorrect_controller);

module.exports = router;