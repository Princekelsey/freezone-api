const express = require("express");
const {
  authorizeUser,
  authorizeConsultant,
} = require("../middleware/authHandler");
const {
  registerUser,
  loginUser,
  registerConsultant,
  loginConsultant,
  getCurrentUser,
  getCurrentConsultant,
} = require("../controllers/authController");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/user/me").get(authorizeUser, getCurrentUser);
router.route("/consultant/register").post(registerConsultant);
router.route("/consultant/login").post(loginConsultant);
router.route("/consultant/me").get(authorizeConsultant, getCurrentConsultant);

module.exports = router;
