const { Router } = require("express");
const {
  sendPost,
  allPost,
  deletePost,
  editPost,
  singlePost,
} = require("../controllers/post-controllers");
const authMiddleware = require("../middlewares/auth-middleware");
const { upload } = require("../utils/cloudinary");

const router = Router();

router.post("/", authMiddleware, upload.single("thumbnail"), sendPost);
router.get("/", allPost);
router.patch(
  "/edit-post/:id",
  authMiddleware,
  upload.single("thumbnail"),
  editPost
);
router.get("/:id", singlePost);
router.delete("/:id", authMiddleware, upload.single("thumbnail"), deletePost);

module.exports = router;
