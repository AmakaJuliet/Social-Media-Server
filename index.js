const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/usersRoute");
const authRoute = require("./routes/authRoute");
const postRoute = require("./routes/postsRoute");

dotenv.config();

mongoose.set("strictQuery", true);
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/", (req, res) => {
  res.send({
    success: true,
    message: "Welcome to the Social Media API Backend",
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Backend Server is running on port: ${process.env.PORT}`);
});
