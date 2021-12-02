const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const event = require("../events/eventListner");
const adminGuard = require("../middleware/adminGuard");
const authGuard = require("../middleware/authGuard");
const { admin, superAdmin, editor, user } = require("../middleware/authRoles");
const combineMiddleware = require("../middleware/combineMiddlewares");
const Course = require("../models/Course");

router.get(
  "/",
  adminGuard([superAdmin, admin, editor, user]),
  async (req, res) => {
    try {
      let courses = null;
      courses = await Course.find({}).select().sort({ createdAt: -1 });
      res.status(200).json(courses);
    } catch (error) {
      res.status(417).json({
        message: "Une erreur est survenue lors du chargement des cours",
        // error: error
      });
    }
  }
);
module.exports = router;
