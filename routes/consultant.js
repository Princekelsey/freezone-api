const express = require("express");
const {
  getAllConsultants,
  updateConsultantImage,
  updateConsultantDetails,
  getSingleConsultant,
} = require("../controllers/consultant");
const { authorizeConsultant } = require("../middleware/authHandler");
const upload = require("../utils/multer").single("image");

const router = express.Router();

router
  .route("/")
  .get(getAllConsultants)
  .put(authorizeConsultant, updateConsultantDetails);
router.route("/image").put(authorizeConsultant, upload, updateConsultantImage);
router.route("/:id").get(getSingleConsultant);

module.exports = router;
