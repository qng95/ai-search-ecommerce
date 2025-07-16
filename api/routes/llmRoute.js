const express = require('express');

const router = express.Router();

const { filterProduct } = require('../controllers/llmController');
//const { isAuthenticatedUser } = require('../middlewares/user_actions/auth');

//router.route('/ai/filter').post(isAuthenticatedUser, filterProduct);
router.route('/ai/filter').post(filterProduct);

module.exports = router;
