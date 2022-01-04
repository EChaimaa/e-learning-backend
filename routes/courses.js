const router = require("express").Router();
const { isValidObjectId } = require("mongoose");
const adminGuard = require("../middleware/adminGuard");
const roles = require("../middleware/authRoles");
const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const multer = require('multer');
const path = require('path');

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


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/' + file.fieldname)
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  }
});

var upload = multer({ storage: storage });


const cpUpload = upload.fields([{ name: 'images', maxCount: 1 }, { name: 'videos', maxCount: 1 }]);

// const baseUrl = "http://192.168.11.103:3000/";
const baseUrl = "https://elearning-fstg.herokuapp.com/";

//Ajouter un cours
router.post("/", adminGuard([roles.user]), cpUpload, async (req, res) => {
  try {
    const files = req.files
    if (!files || files.images.length === 0 || files.videos.length === 0) {
      const error = new Error('Certains fichers manquent, veuillez réessayer')
      error.httpStatusCode = 400
      return next(error)
    }

    const image = baseUrl + req.files.images[0].path.replace(/\\/g, "/");
    const video = baseUrl + req.files.videos[0].path.replace(/\\/g, "/");

    const {
      email,
      title,
      description,
      paragraphs,
      quiz,
      categoryId,
    } = req.body;

    const paras = JSON.parse(paragraphs);

    const quizToSave = JSON.parse(quiz);
    quizToSave.map((q) => {
      q.uniqueChoice = JSON.parse(q.uniqueChoice);
      q.beginTime = parseInt(q.beginTime);
      q.endTime = parseInt(q.endTime);
      q.responses = [];
      q.choices = JSON.parse(q.choices).map(choice => ({
        order: parseInt(choice.order),
        text: choice.text,
        correct: JSON.parse(choice.correct),
      }));
    });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({
        message: "Cet utilisateur n'existe pas",
      });
    }

    const username = user.firstname + " " + user.lastname;

    let id = categoryId;

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
      paragraphs: paras,
      quiz: quizToSave,
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
        if (element.beginTime == req.body.beginTime) {
          if (!element.responses.find((resp) => resp.name == req.body.name)) {
            element.responses.push({
              name: req.body.name,
              correct: req.body.correct,
            });
          }
          return;
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
