const jwt = require("jsonwebtoken");
const config = process.env;

const authGuard = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers["authorization"];

  // console.log("token: ", token);

  if (!token) {
    return res.status(403).json({
      message: "Veuillez vous connecter pour effectuer cette opération.",
    });
  }
  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;

    if (decoded.user_id !== req.params.id) {
      return res.status(403).json({
        message: "Vous n'avez pas le droit nécessaire pour effectuer cette opération.",
      });
    }
  } catch (err) {
    return res.status(401).json({
      message:
        "Erreur: Veuillez vous connecter pour effectuer cette opération.",
    });
  }
  return next();
};

module.exports = authGuard;
