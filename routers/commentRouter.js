const router = require("express").Router();
const commentController = require("../controllers/commentController");
const auth = require("../middlewares/auth");

router.post("/comment", auth, commentController.createComment);
router.patch("/comment/like/:id", auth, commentController.likeComment);
router.patch("/comment/unlike/:id", auth, commentController.unLikeComment);
router.patch("/comment/:id", auth, commentController.updateComment);
router.delete("/comment/:id", auth, commentController.deleteComment);

module.exports = router;
