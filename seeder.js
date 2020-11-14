const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config({ path: "./config/config.env" });
const colors = require("colors");

// connect to database
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  // load models
  const User = require("./models/Users")
  const Consultant = require("./models/Consultants")
  const Room = require("./models/Room")

  // read bootcamps json file
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
  );
  
  const consultants = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/consultants.json`, "utf-8")
  );
  
  const rooms = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/rooms.json`, "utf-8")
  );


  // load data to database
const saveData = async () => {
    try {
      await User.create(users);
      await Consultant.create(consultants);
      await Room.create(rooms);
      console.log("Data loaded".green.inverse);
      process.exit();
    } catch (error) {
      console.log(error.message.red);
    }
  };

  // Delete data from database
const deleteData = async () => {
    try {
      await Consultant.deleteMany();
      await Room.deleteMany();
      await User.deleteMany();
      console.log("Data deleted".red.inverse);
      process.exit();
    } catch (error) {
      console.log(error.message.red);
    }
  };

  // intialize
if (process.argv[2] === "-i") {
    saveData();
  } else if (process.argv[2] === "-d") {
    deleteData();
  }