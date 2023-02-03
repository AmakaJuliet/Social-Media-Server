const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

//update user
router.put("/:id", userController.updateAccount);
//delete user
router.delete("/:id", userController.deleteAccount);
//get a user
router.get("/:id", userController.getUser);
//follow user
router.put("/:id/follow", userController.followUser);
//unfollow user
router.put("/:id/unfollow", userController.unfollowUser);

module.exports = router;
