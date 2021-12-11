const router = require("express").Router();
const adminGuard = require("../middleware/adminGuard");
const roles = require("../middleware/authRoles");
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
    const { email, title, description, image, video, paragraphs, quiz } =
      req.body;
    /* const oldCourse = await Course.findOne({title});

  if (oldCourse) {
    return res.status(409).json({
      message: "Ce cours existe déjà",
    });
  }
*/
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({
        message: "Cet utilisateur n'existe pas",
      });
    }
    const username = user.firstname + " " + user.lastname;

    const newCourse = new Course({
      email,
      title,
      description,
      image,
      video,
      paragraphs,
      quiz,
      username,
    });

    await newCourse.save().then((doc) => {
      res.status(201).json({
        message: "Cours créé avec succès",
        course: doc,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Une erreur inantandue s'est produite. Veuillez réessayer plus tard.",
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
    console.logt(error);
  }
});

router.delete("/", adminGuard([roles.user]), async (req, res) => {
  if (!(await Course.findById(req.query.id))) {
    return res.status(404).json({
      message: "cours introuvable",
    });
  }

  await Course.findByIdAndRemove(req.query.id);

  return res.status(200).json({
    message: "Cours supprimé avec succès.",
  });
});

module.exports = router;
