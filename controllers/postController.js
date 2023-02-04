const Post = require("../models/postSchema");
const User = require("../models/userSchema");

exports.createPost = async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(201).json({
      success: true,
      message: "Post created Successfully",
      post: savedPost,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "There was an error",
      error: err.message,
    });
  }
};

exports.getPost = async (req, res) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        success: false,
        message: `No Post with ID: ${id} found!`,
      });
    res
      .status(200)
      .json({ success: true, message: "Post retrieved successfully", post });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "There was an error",
      error: err.message,
    });
  }
};

exports.toggleViewPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.views.includes(req.body.userId)) {
      await post.updateOne({ $push: { views: req.body.userId } });
      res.status(200).json("The post has been viewed");
    } else {
      await post.updateOne({ $pull: { views: req.body.userId } });
      res.status(200).json("The post has been unviewed");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getTimelinePost = async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    const allPosts = userPosts.concat(...friendPosts);
    res.status(200).json({
      success: true,
      message: `${allPosts.length} Posts retrieved successfully`,
      data: allPosts,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "There was an error", error: err });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res
        .status(200)
        .json({ success: true, message: "the post has been updated" });
    } else {
      res
        .sendStatus(403)
        .json({ success: false, message: "you can update only your post" });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "There was an error",
      error: err.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return res
      .status(404)
      .json({ success: false, message: "No document with this ID" });
  }
  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
    data: "null",
  });
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res
        .status(200)
        .json({ success: true, message: "The post has been liked" });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res
        .status(200)
        .json({ success: true, message: "The post has been unliked" });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "There was an error",
      error: err.message,
    });
  }
};
