const express = require("express");

const ctrl = require("../../controllers/auth-controllers");

const {authenticate, upload} = require("../../middlewares");

const router = express.Router();


router.post("/register",  ctrl.register );

router.get("/verify/:verificationCode", ctrl.verify);

router.post("/verify", ctrl.resendVerify);

router.post("/login", ctrl.login);

router.get("/current", authenticate, ctrl.getCurrent);

router.post("/logout", authenticate, ctrl.logout);

router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar)

module.exports = router;