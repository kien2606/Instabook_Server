const router = require("express").Router();
const postController = require("../controllers/postController");
const auth = require("../middlewares/auth");

router
  .route("/posts")
  .post(auth, postController.createPost)
  .get(auth, postController.getPosts);

router
  .route("/posts/:id")
  .patch(auth, postController.updatePost)
  .delete(auth, postController.deletePost);

router.get("/post/:id", auth, postController.getPost);
router.get("/user_posts/:id", auth, postController.getUserPosts);
router.patch("/post/like/:id", auth, postController.likePost);
router.patch("/post/unlike/:id", auth, postController.unLikePost);

router.get("/posts_discover", auth, postController.getDiscoverPost);
router.get("/save_posts", auth, postController.getSavePost);


router.patch("/save_post/:id", auth, postController.savePost);
router.patch("/unSave_post/:id", auth, postController.unSavePost);

module.exports = router;
