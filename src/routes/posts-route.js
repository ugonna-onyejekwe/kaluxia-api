const { Router } = require("express");
const {
  sendPost,
  allPost,
  deletePost,
  editPost,
  singlePost,
} = require("../controllers/post-controllers");
const authMiddleware = require("../middlewares/auth-middleware");

const router = Router();

router.post("/", authMiddleware, sendPost);
router.get("/", allPost);
router.patch("/edit-post/:id", authMiddleware, editPost);
router.get("/:id", singlePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
