const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:orderId', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/remove/:orderId/:medicineId', cartController.removeFromCart);

module.exports = router;
