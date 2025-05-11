const express = require('express')
const {findAll}  = require('../controllers/auth.controller')
const router = express.Router();

router.get("/users", findAll)
// router.post("auth/new", singup);
// router.post("/auth", login);

module.exports = router;
