const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(password, salt);

    const oldUser = await User.findOne({ email });

    if (oldUser) {
        return res.status(409).json({
            message: "Cette addresse email est déjà associée à un compte"
        });
    }

    const user = new User({
        username,
        email,
        password: hash
    });

    try {
        await user.save();
        res.status(201).json({
            message: 'Compte créé avec succès, un email de validation vous a été envoyé.',
            // user: result
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: err
        });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({
                message: 'Les informations saisies sont incorrectes.'
            });
        }

        const passwordIsValid = await bcrypt.compare(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({
                message: 'Les informations saisies sont incorrectes.'
            });
        }

        if (!user.isActivated) {
            return res.status(401).json({
                message: 'Vous n\'avez pas encore activé votre compte, veuillez vérifier votre boite mail.'
            });
        }

        if (!user.isApprouved) {
            return res.status(401).json({
                message: 'Votre compte n\'a pas encore été validé par un administrateur, réessayez plus tard ou contactez votre administrateur.'
            });
        }

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email: user.email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        res.status(200).json({
            message: 'Vous êtes connecté.',
            user: user
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});

module.exports = router;