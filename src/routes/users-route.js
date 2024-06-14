// import { Router } from "express";
const { Router } = require("express");
const authMiddleware = require("../middlewares/auth-middleware");

const {
  create_new_user,
  loginUser,
  allusers,
  singleUser,
  editUser,
  changeAvatar,
  authSession,
} = require("../controllers/users-controllers");

const router = Router();
router.get("/authSession", authMiddleware, authSession);
router.post("/sign-in", create_new_user);
router.post("/login", loginUser);
router.get("/", allusers);
router.get("/:id", singleUser);
router.patch("/edit-user-info", authMiddleware, editUser);
router.patch("/:id/change-avatar", authMiddleware, changeAvatar);
// export default router;

module.exports = router;
