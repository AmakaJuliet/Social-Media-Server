const router = require("express").Router();
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

//create a post
router.post("/", authController.protect, postController.createPost);

//get a post
router.get("/:id", authController.protect, postController.getPost);

//update a post
router.put("/:id", authController.protect, postController.updatePost);

//delete a post
router.delete(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  postController.deletePost
);

//like a post // dislike a post
router.put("/:id/like", authController.protect, postController.likePost);

//get timeline posts
router.get(
  "/timeline/all",
  authController.protect,
  postController.getTimelinePost
);

//view a post // unview a post
router.put("/:id/view", postController.toggleViewPost);

module.exports = router;
