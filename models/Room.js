const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: [true, "Please enter room name"],
    unique: true,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  members: {
    type: [{ alias: String, userId: String }],
    default: [],
  },
  chatHistory: {
    type: [
      { message: String, senderAlias: String, senderId: String, date: Date },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Room", RoomSchema);
