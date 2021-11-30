const router = require('express').Router();
const authGuard = require('../middleware/auth');

router.get('/', authGuard, (req, res) => {
    res.send('Hello from users route ' + req.user.email);
});

module.exports = router;