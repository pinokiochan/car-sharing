const express = require("express");
const router = express.Router();
const carController = require("../controllers/car.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyAdmin } = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/add", verifyToken, verifyAdmin, upload.single("img"), carController.addCar);
router.get("/filters", carController.getFilters);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.put("/:id", verifyToken, verifyAdmin, carController.updateCarAttribute);
router.put("/:id/image", verifyToken, verifyAdmin, upload.single("img"), carController.updateCarImage);

module.exports = router;
