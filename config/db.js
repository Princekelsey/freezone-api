const mongoose = require("mongoose");

const dbConnection = async () => {
  const connec = await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(
    `MongoDB connected: ${connec.connection.host}`.cyan.underline.bold
  );
};

module.exports = dbConnection;
