const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

//update user
router.put("/:id", authController.protect, userController.updateAccount);
//delete user
router.delete(
  "/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.deleteAccount
);
//get a user
router.get("/:id", authController.protect, userController.getUser);
//follow user
router.put("/:id/follow", authController.protect, userController.followUser);
//unfollow user
router.put(
  "/:id/unfollow",
  authController.protect,
  userController.unfollowUser
);

module.exports = router;
