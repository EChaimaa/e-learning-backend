const router = require("express").Router();
const adminGuard = require("../middleware/adminGuard");
const roles = require("../middleware/authRoles");
const Category = require("../models/Category");
const User = require("../models/User");

//Récupérer la liste des catégories
router.get("/", async (req, res) => {
  try {
    let categories = null;
    categories = await Category.find({}).select().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(417).json({
      message: "Une erreur est survenue lors du chargement des catégories",
    });
  }
});

//Ajouter une catégorie
router.post("/", adminGuard([roles.user]), async (req, res) => {
  try {
    const { title, description } = req.body;

    const category = await Category.findOne({ title });

    if (category) {
      return res.status(409).json({
        message:
          "Cette catégorie existe déjà, veuillez ajouter une nouvelle SVP",
      });
    }

    const newCategory = new Category({
      title,
      description,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json({
      message: "Catégorie créé avec succès",
      category: savedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Une erreur inatendue s'est produite. Veuillez réessayer plus tard.",
    });
  }
});

//modifier une catégorie
router.put("/", adminGuard([roles.user]), async (req, res) => {
  try {
    if (!(await Category.findById(req.query.id))) {
      return res.status(404).json({
        message: "Catégorie introuvable",
      });
    }

    Category.findOneAndUpdate(
      { _id: req.query.id },
      req.body,
      { new: true },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message:
              "Une erreur est survenue lors de la modification de la catégorie",
            error: err,
          });
        }
        if (doc) {
          return res.status(200).json({
            message: "La catégorie a été bien modifiée",
            category: doc,
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

//Supprimer une catégorie
router.delete("/", adminGuard([roles.user]), async (req, res) => {
  try {
    if (!(await Category.findById(req.query.id))) {
      return res.status(404).json({
        message: "Catégorie introuvable",
      });
    }

    await Category.findByIdAndRemove(req.query.id);

    return res.status(200).json({
      message: "Catégorie supprimée avec succès.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        "Une erreur inatendue s'est produite. Veuillez réessayer plus tard.",
    });
  }
});

module.exports = router;
