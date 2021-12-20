const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { hasAnyRole } = require("../utils/roleUtils");
const { admin } = require("./authRoles");
const config = process.env;

const adminGuard = (roles = []) => async (req, res, next) => {
  let token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      message: "Veuillez vous connecter pour effectuer cette opération."
    });
  }
  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, config.TOKEN_KEY);

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(403).json({
        message: "Veuillez vous connecter pour effectuer cette opération."
      });
    }

    // Check if user has the right role
    if (!hasAnyRole(user, roles)) {
      return res.status(403).json({
        message: "Vous n'avez pas les droits pour effectuer cette opération."
      });
    }

    req.user = user;
    return next();

  } catch (err) {
    return res.status(401).json({
      message: "Erreur: Veuillez vous connecter pour effectuer cette opération."
    });
  }
};

module.exports = adminGuard;