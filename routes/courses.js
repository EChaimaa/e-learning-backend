const router = require("express").Router();
const { isValidObjectId } = require("mongoose");
const adminGuard = require("../middleware/adminGuard");
const roles = require("../middleware/authRoles");
const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");

//Récupérer la liste des cours
router.get("/", async (req, res) => {
  try {
    let courses = null;
    courses = await Course.find({}).select().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(417).json({
      message: "Une erreur est survenue lors du chargement des cours",
    });
  }
});

//Ajouter un cours
router.post("/", adminGuard([roles.user]), async (req, res) => {
  try {
    const {
      email,
      title,
      description,
      image,
      video,
      paragraphs,
      quiz,
      categoryId,
    } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({
        message: "Cet utilisateur n'existe pas",
      });
    }

    const username = user.firstname + " " + user.lastname;

    let id;

    if (!isValidObjectId(categoryId)) {
      const foundCat = await Category.findOne({ title: categoryId });
      if (foundCat != null) {
        id = foundCat._id?.toString();
      } else {
        let cat = new Category({
          title: categoryId,
          description: "",
        });
        cat = await cat.save();
        id = cat._id?.toString();
      }
    }

    const newCourse = new Course({
      email,
      title,
      description,
      image,
      video,
      paragraphs,
      quiz,
      username,
      categoryId: id,
    });

    const savedCourse = await newCourse.save();
    res.status(201).json({
      message: "Cours créé avec succès",
      course: savedCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Une erreur inatendue s'est produite. Veuillez réessayer plus tard.",
    });
  }
});

//modifier un course
router.put("/", adminGuard([roles.user]), async (req, res) => {
  try {
    if (!(await Course.findById(req.query.id))) {
      return res.status(404).json({
        message: "cours introuvable",
      });
    }
    const categoryId = req.body.categoryId;
    if (!isValidObjectId(categoryId)) {
      const foundCat = await Category.findOne({ title: categoryId });
      if (foundCat != null) {
        req.body.categoryId = foundCat._id?.toString();
      } else {
        let newCat = new Category({
          title: categoryId,
          description: "",
        });
        newCat = await newCat.save();
        req.body.categoryId = newCat._id?.toString();
      }
    }

    Course.findOneAndUpdate(
      { _id: req.query.id },
      req.body,
      { new: true },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Une erreur est survenue lors de la modification du cours",
            error: err,
          });
        }
        if (doc) {
          return res.status(200).json({
            message: "Le cours a été bien modifié",
            course: doc,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Une erreur inatendue s'est produite. Veuillez réessayer plus tard.",
    });
  }
});

//Supprimer un cours
router.delete("/", adminGuard([roles.user]), async (req, res) => {
  try {
    if (!(await Course.findById(req.query.id))) {
      return res.status(404).json({
        message: "cours introuvable",
      });
    }

    await Course.findByIdAndRemove(req.query.id);

    return res.status(200).json({
      message: "Cours supprimé avec succès.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Une erreur inatendue s'est produite. Veuillez réessayer plus tard.",
    });
  }
});

//modifier le nombre de vues
router.put("/updateViews", adminGuard([roles.user]), async (req, res) => {
  try {
    let course = await Course.findById(req.query.id);

    if (!course) {
      return res.status(404).json({
        message: "cours introuvable",
      });
    }

    course.numViews = course.numViews + 1;

    Course.findOneAndUpdate(
      { _id: req.query.id },
      course,
      { new: true },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message:
              "Une erreur est survenue lors de l'incrémentation du nombre des vues du cours",
            error: err,
          });
        }
        if (doc) {
          return res.status(200).json({
            message: "Le nombre de vues de ce cours a été bien modifié",
            course: doc,
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Une erreur inatendue s'est produite. Veuillez réessayer plus tard.",
    });
  }
});

//modifier les quizs
router.put(
  "/respond",
  adminGuard([roles.user, roles.etudiant, roles.superAdmin]),
  async (req, res) => {
    try {
      let course = await Course.findById(req.query.id);

      if (!course) {
        return res.status(404).json({
          message: "cours introuvable",
        });
      }

      course.quiz.forEach((element) => {
        if (element.beginTime === req.body.beginTime) {
          element.responses.push({
            name: req.body.name,
            correct: req.body.correct,
          });
        }
      });

      Course.findOneAndUpdate(
        { _id: req.query.id },
        course,
        { new: true },
        (err, doc) => {
          if (err) {
            return res.status(500).json({
              message:
                "Une erreur est survenue lors de modification de quiz pour ce cours",
              error: err,
            });
          }
          if (doc) {
            return res.status(200).json({
              message: "Le quiz de ce cours a été bien modifié",
              course: doc,
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:
          "Une erreur inatendue s'est produite. Veuillez réessayer plus tard.",
      });
    }
  }
);

module.exports = router;
