const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    beginTime: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    endTime: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    uniqueChoice: {
      type: Boolean,
      required: true,
    },
    shown: {
      type: Boolean,
    },
    passed: {
      type: Boolean,
    },
    choices: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
