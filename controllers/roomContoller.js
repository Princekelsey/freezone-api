const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Room = require("../models/Room");
const User = require("../models/Users");

// @desc    Create room
// @route   POST /api/v1/room
// @access  Private
exports.createChatRoom = asyncHandler(async (req, res, next) => {
  req.body.author = req.user.id;
  const user = await User.findById(req.user.id);
  if (!user) {
    return new ErrorResponse(`Not authorized`, 401);
  }
  const newData = {
    roomName: req.body.roomName,
    author: req.user.id,
    members: [{ alias: user.alias, userId: req.user.id }],
  };
  const room = await Room.create(newData);

  if (!room) {
    return new ErrorResponse(`Error creating room. Try again`, 400);
  }

  res.status(201).json({
    success: true,
    data: room,
  });
});

// @desc    Get all chatrooms
// @route   GET /api/v1/room
// @access  Public
exports.getAllChatRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.find().populate({
    path: "author",
    select: "alias id",
  });

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Get single chatroom
// @route   GET /api/v1/room/:id
// @access  Public
exports.getSingleChatRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate({
    path: "author",
    select: "alias id",
  });

  if (!room) {
    return next(
      new ErrorResponse(`No chat room with the id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Get chatrooms by authorId
// @route   GET /api/v1/room/author/:id
// @access  Public
exports.getAuthorChatRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.find({ author: req.params.id }).populate({
    path: "author",
    select: "alias id",
  });

  if (!room || !room.length) {
    return next(
      new ErrorResponse(
        `No chat room with an author with id:  ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc    Get chatrooms for a user
// @route   GET /api/v1/room/joined/user
// @access  Private
exports.getUserChatRooms = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("Unauthorized route"));
  }

  const rooms = await Room.find({
    members: { $elemMatch: { userId: req.user.id } },
  }).populate({ path: "author", select: "alias id" });

  res.status(200).json({
    success: true,
    data: rooms,
  });
});

// @desc    Join chatrooms
// @route   POST /api/v1/room/join
// @access  Public
exports.joinChatRoom = asyncHandler(async (req, res, next) => {
  const { roomId, userId } = req.body;
  // Validate data
  if (!roomId || !userId) {
    return next(new ErrorResponse("Please provide roomId and userId", 400));
  }
  const room = await Room.findById(roomId).populate({
    path: "author",
    select: "alias id",
  });

  const user = await User.findById(userId);

  const userAlready = await Room.find({
    _id: roomId,
    members: { $elemMatch: { userId } },
  });

  if (!room) {
    return next(new ErrorResponse(`No chat room with the ${roomId}`, 404));
  }

  if (!user) {
    return next(new ErrorResponse(`No user with the ${userId}`, 404));
  }

  if (userAlready.length) {
    return next(new ErrorResponse(`User already joined this room`, 404));
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    { _id: roomId },
    {
      $push: { members: { alias: user.alias, userId: userId } },
    },
    { new: true }
  ).populate({ path: "author", select: "alias id" });

  if (!updatedRoom) {
    return next(new ErrorResponse(`Error joining room, try again `, 404));
  }

  res.status(200).json({
    success: true,
    data: updatedRoom,
  });
});

// @desc    Send message to chatrooms
// @route   POST /api/v1/room/:id/message
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  if (!message || message === "") {
    return next(new ErrorResponse(`Please enter a message`, 400));
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse(`Not authorized`, 401));
  }
  const room = await Room.find({
    _id: req.params.id,
    members: { $elemMatch: { userId: req.user.id } },
  });

  if (!room.length) {
    return next(new ErrorResponse(`Not authorized`, 401));
  }

  const messageObj = {
    message,
    senderAlias: user.alias,
    senderId: req.user.id,
    date: Date.now(),
  };

  const updatedRoom = await Room.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $push: { chatHistory: messageObj },
    },
    { new: true }
  );

  if (!updatedRoom) {
    return next(new ErrorResponse(`Error sending message, try again `, 404));
  }

  res.status(200).json({
    status: true,
    data: updatedRoom,
  });
});

// @desc    Delete chatrooms
// @route   POST /api/v1/room/:id
// @access  Private
exports.deleteChatRoom = asyncHandler(async (req, res, next) => {
  const userRoom = await Room.find({ author: req.user.id });
  const room = await Room.findById(req.params.id);

  if (!userRoom || !userRoom.length) {
    return next(
      new ErrorResponse(
        `No chat room with an author with id:  ${req.user.id}`,
        404
      )
    );
  }

  if (!room) {
    return next(
      new ErrorResponse(`No chat room with an id:  ${req.params.id}`, 404)
    );
  }

  await Room.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: { id: req.params.id },
  });
});
