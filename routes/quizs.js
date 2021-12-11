const router = require("express").Router();
const adminGuard = require("../middleware/adminGuard");
const roles = require("../middleware/authRoles");
const Course = require("../models/Course");
const Quiz = require("../models/Quiz");
const User = require("../models/User");

//Récupérer la liste des questions quiz d'un cours donné
router.get("/", async (req, res) => {
  try {
    if (!(await Course.findById(req.query.id))) {
      return res.status(404).json({
        message: "cours introuvable",
      });
    }

    let quizs = null;
    quizs = await Course.find({}).select("quiz").sort({ createdAt: -1 });
    return res.status(200).json(quizs);
  } catch (error) {
    console.log(console.error);

    return res.status(417).json({
      message: "Une erreur est survenue lors du chargement des quizs",
    });
  }
});

module.exports = router;
