const express = require("express");
const mongoose = require("mongoose");
const Post = require("../Models/Post");
const User = require("../Models/User");
const Comment = require('../Models/Comment');
const { body, validationResult} = require('express-validator');
const fetchuser = require("../Middleware/fetchUser");
const router = express.Router();

// Route 1 : Creating a new Post using POST : /api/post/createnewpost, login required

router.post("/createnewpost", fetchuser, [], async (req, res) => {
  try {
    const newPost = new Post({
      author: req.user.id,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      images: req.body.images,
      videos: req.body.videos,
    });

    await newPost.save();

    const user = await User.findById(req.user.id);
    user.posts.push(newPost);

    await user.save();

    res.json(newPost);
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ error: "Some error occurred" });
  }
});

// ROUTE - 2 :  Get all the posts of the logged in user using : GET : /api/posts/getallposts, login required

router.get("/getallposts", fetchuser, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id });
    if (!posts) {
      return res.json({ message: "You don't have any posts" });
    }
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
    console.log(e.message);
  }
});

// ROUTE 3 : Editing an existing post using PUT : /api/post/editpost/:id

router.put("/editpost/:id", fetchuser, [], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "No such post exists" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You're not allowed to edit this post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(post.id, {
      title: req.body.title || post.title,
      content: req.body.content || post.content,
      tags: req.body.tags || post.tags,
    });

    res.json(updatedPost);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ROUTE - 4 : Search for posts with specific tags using GET : /api/post/searchbytag/:id
router.get("/searchbytag/:tag", async (req, res) => {
  try {
    const tag = req.params.tag;

    const posts = await Post.find({ tags: { $in: [tag] } });
    if (!posts) {
      return res.json({ error: "No posts for the given tag" });
    }
    res.json(posts);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server error" });
  }
});

// ROUTE - 5 : Delete an existing post using DELETE : /api/post/

router.delete("/deletepost/:id", fetchuser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "No such post exists" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You're not allowed to delete this post" });
    }

    // Remove the post reference from the user's 'posts' array
    const user = await User.findById(req.user.id);
    const postIndex = user.posts.indexOf(post._id);
    if (postIndex > -1) {
      user.posts.splice(postIndex, 1);
    }

    await user.save();
    await Post.deleteOne({ _id: post._id });

    res.json({ success: "Post deleted successfully" });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ROUTE - 6: Get posts from users other than the logged-in user using GET
router.get("/feed", fetchuser, async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // Find posts whose author is not the logged-in user
    const posts = await Post.find({ author: { $ne: loggedInUserId } });

    if (!posts || posts.length === 0) {
      return res.json({ message: "No posts from other users found" });
    }

    res.json(posts);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Internal Server error" });
  }
});


// ROUTE : 7 Fetching all the comments on a particular post using GET : /api/post/getcomments/:id
router.get("/getcomments/:postId", fetchuser, async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId }).populate({
      path: "author",
      select: "username",
    });

    if (comments.length === 0) {
      return res.json({ message: "No comments on the post" });
    } else {
      const commentsWithAuthor = comments.map((comment) => ({
        text: comment.text,
        author: comment.author,
      }));
      res.json(commentsWithAuthor);
    }
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
