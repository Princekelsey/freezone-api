const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoSanitze = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const dotenv = require("dotenv").config({ path: "./config/config.env" });
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");

// models
const User = require("./models/Users");
const Room = require("./models/Room");

const userAuth = require("./routes/auth");
const chatRoom = require("./routes/room");
const consultant = require("./routes/consultant");
const errorHandler = require("./middleware/errorHandler");

const dbConnection = require("./config/db");
const ErrorResponse = require("./utils/errorResponse");

// connect database
dbConnection();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Sanitze data
app.use(mongoSanitze());

// Security headers
app.use(helmet());

// prevent XSS attack
app.use(xss());

// rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

//prevent http param pollution
app.use(hpp());

// dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// static folder
app.use(express.static(path.join(__dirname, "public")));

// set routers
app.use("/api/v1/auth", userAuth);
app.use("/api/v1/room", chatRoom);
app.use("/api/v1/consultant", consultant);

//error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `App runing in ${process.env.NODE_ENV} and listening on port ${PORT}!`
      .yellow.bold
  );
});

const io = require("socket.io")(server);

// step up socket webHooks

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;

    if (!token) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }

    const user = await User.findById(token);

    if (!user) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
    socket.userId = user._id;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

io.on("connection", (socket) => {
  console.log("Connected: " + socket.userId);

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);
  });

  socket.on("joinRoom", ({ chatroomId }) => {
    socket.join(chatroomId);
    console.log("A user joined chatroom: " + chatroomId);
  });

  socket.on("leaveRoom", ({ chatroomId }) => {
    socket.leave(chatroomId);
    console.log("A user left chatroom: " + chatroomId);
  });

  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    if (message.trim().length > 0) {
      const user = await User.findOne({ _id: socket.userId });
      if (user) {
        const messageObj = {
          message,
          senderAlias: user.alias,
          senderId: user._id,
          date: Date.now(),
        };

        io.to(chatroomId).emit("newMessage", messageObj);

        const room = await Room.find({
          _id: chatroomId,
          members: { $elemMatch: { userId: user._id } },
        });

        if (room.length) {
          await Room.findByIdAndUpdate(
            { _id: chatroomId },
            {
              $push: { chatHistory: messageObj },
            },
            { new: true }
          );
        }
      }
    }
  });
});

// handle promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
