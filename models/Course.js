const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    description: {
      type: String,
      required: true,
      min: 3,
      max: 500,
    },
    image: {
      type: String,
      min: 3,
      max: 500,
    },
    video: {
      type: String,
      required: true,
      min: 3,
      max: 500,
    },
    email: {
      type: String,
      required: true,
      min: 3,
      max: 500,
    },
    username: {
      type: String,
      required: false,
      min: 3,
      max: 500,
    },
    paragraphs: {
      type: Array,
      default: [],
      required: true,
    },
    quiz: {
      type: Array,
      default: [],
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
