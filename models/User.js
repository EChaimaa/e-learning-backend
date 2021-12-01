const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      min: 3,
      max: 20,
    },
    lastname: {
      type: String,
      min: 3,
      max: 20,
    },
    username: {
      type: String,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    token: {
      type: String,
      required: false,
    },
    activationToken: {
      type: String,
      required: false,
    },
    roles: {
      type: Array,
      default: [],
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    isApprouved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
