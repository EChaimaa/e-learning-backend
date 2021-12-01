const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const event = require("../events/eventListner");
const adminGuard = require("../middleware/adminGuard");
const authGuard = require("../middleware/authGuard");
const { admin, superAdmin } = require("../middleware/authRoles");
const combineMiddleware = require("../middleware/combineMiddlewares");
const User = require("../models/User");

router.get("/", adminGuard([superAdmin, admin]), async (req, res) => {
  try {
    console.log(req.query.toApprove);
    let users = null;
    users = req.query.toApprove
      ? await User.find({ isApproved: false })
          .select("-password")
          .sort({ createdAt: -1 })
      : await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(417).json({
      message: "Une erreur est survenue lors du chargement des utilisateurs",
      // error: error
    });
  }
});

router.put(
  "/update",
  combineMiddleware([adminGuard([superAdmin, admin]), authGuard]),
  async (req, res) => {
    try {
      if (!(await User.findById(req.query.id))) {
        return res.status(404).json({
          message: "Utilisateur introuvable",
        });
      }

      User.findOneAndUpdate(
        { _id: id },
        req.body.user,
        { new: true },
        (err, doc) => {
          if (err) {
            return res.status(500).json({
              message:
                "Une erreur est survenue lors de la modification de l'utilisateur",
              error: err,
            });
          }
          if (doc) {
            res.status(200).json({
              message: "Votre compte a été validé avec succès",
              user: doc,
            });
          }
        }
      );
    } catch (error) {
      res.status(417).json({
        message:
          "Une erreur est survenue lors de la validation de votre compte",
      });
    }
  }
);

// add username and password to a user
// body: { username, password, email, activationToken }
router.put("/createAccount", async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      message: "Utilisateur introuvable",
    });
  }

  if (
    !req.body.activationToken ||
    !user.activationToken ||
    req.body.activationToken !== user.activationToken
  ) {
    return res.status(403).json({
      message: "Le token n'est pas valide ou a expiré.",
    });
  }

  // we can proceed to create the account
  user.username = username;

  // hashing the password
  const salt = await bcrypt.genSaltSync(10);
  user.password = await bcrypt.hashSync(password, salt);

  user.activationToken = undefined;

  await user.save();
  res.status(201).json({
    message:
      "Compte créé avec succès, Vous pouvez désormais essayer de vous connecter.",
  });
});

// body: { email }
router.post("/resendActivationEmail", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      message: "Votre compte est introuvable, veuillez vous réinscrire.",
    });
  }

  if (user.isActivated && !user.activationToken) {
    return res.status(403).json({
      message: "Votre compte est déjà activé.",
    });
  }

  // Create activation token
  const activationToken = jwt.sign(
    { email: user.email },
    process.env.TOKEN_KEY,
    {
      expiresIn: "24h",
    }
  );

  user.activationToken = activationToken;
  await user.save();

  // send an email to the user
  event.emit("sendActivationEmail", user);

  res.status(200).json({
    message: "Succès: Un email d'activation vous a été envoyé.",
  });
});

router.put("/approve", adminGuard([superAdmin, admin]), async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(406).json({
        message: "Ce utilisateur n'existe pas.",
      });
    }
    user.isApproved = true;
    await user.save();
    res.status(202).json({
      message: "Utilisateur approuvé avec succès.",
    });
  } catch (error) {
    res.status(417).json({
      message: "Une erreur est survenue lors de cette opération.",
      // error: error
    });
  }
});

// body: { token }
router.put("/activate", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ activationToken: token });
    if (!user) {
      return res.status(406).json({
        message: "Ce lien n'est pas/plus valide.",
      });
    }
    user.isActivated = true;
    await user.save();
    res.status(202).json({
      message: "Votre compte a été activé avec succès.",
    });
  } catch (error) {
    res.status(417).json({
      message: "Une erreur est survenue lors de cette opération.",
    });
  }
});

module.exports = router;
