const router = require("express").Router();
const postController = require("../controllers/postController");

//create a post
router.post("/", postController.createPost);

//get a post
router.get("/:id", postController.getPost);

//update a post
router.put("/:id", postController.updatePost);

//delete a post
router.delete("/:id", postController.deletePost);

//like a post // dislike a post
router.put("/:id/like", postController.likePost);

//get timeline posts
router.get("/timeline/all", postController.getTimelinePost);

//view a post // unview a post
router.put("/:id/view", postController.toggleViewPost);

module.exports = router;
