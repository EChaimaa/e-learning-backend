const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    description: {
      type: String,
      required: false,
      min: 3,
      max: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
