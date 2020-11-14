const mongoose = require("mongoose");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ConsultantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
    select: false,
  },
  title: {
    type: String,
    required: [true, "Please add a title"],
    enum: ["doctor", "counselor"],
  },
  description: {
    type: String,
    default: null,
  },
  shortInfo: {
    type: String,
    required: [true, "ShortInfo must be entered"],
    maxlength: [1000, "ShortInfo cannot be more than 100 characters"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  image: {
    type: String,
    default: null,
  },

  cloudinaryId: {
    type: String,
    default: null,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password
ConsultantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bycrpt.genSalt(10);
  this.password = await bycrpt.hash(this.password, salt);
  next();
});

// sign jwt and return
ConsultantSchema.methods.signJWTandReturn = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare login password with hashed password in database
ConsultantSchema.methods.matchPassword = async function (loginPassword) {
  return await bycrpt.compare(loginPassword, this.password);
};

module.exports = mongoose.model("Consultant", ConsultantSchema);
