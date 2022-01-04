const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const multer = require('multer');
const path = require('path');
var cors = require("cors");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const quizRoutes = require("./routes/quizs");
const categoryRoutes = require("./routes/categories");
const imageRoutes = require("./routes/images");

const app = express();

dotenv.config();
app.use(cors());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, () => {
  console.log("Connected to MongoDB");
});

//middelware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use('/uploads', express.static(__dirname + '/uploads'));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/quizs", quizRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/images", imageRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started at port 3000");
});
