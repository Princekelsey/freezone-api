const mongoose = require("mongoose");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  alias: {
    type: String,
    required: [true, "Please add an alias"],
    unique: true,
  },

  role: {
    type: String,
    enum: ["user", "doctor", "counselor"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bycrpt.genSalt(10);
  this.password = await bycrpt.hash(this.password, salt);
  next();
});

// sign jwt and return
UserSchema.methods.signJWTandReturn = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare login password with hashed password in database
UserSchema.methods.matchPassword = async function (loginPassword) {
  return await bycrpt.compare(loginPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
