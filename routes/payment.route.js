const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/", verifyToken, paymentController.processPayment);
router.get("/summary", verifyToken, paymentController.getPaymentSummary);

module.exports = router;
