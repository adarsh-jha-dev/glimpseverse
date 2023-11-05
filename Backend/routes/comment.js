const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../Middleware/fetchUser");
const Comment = require("../Models/Comment");
const Post = require("../Models/Post");

const router = express.Router();

// ROUTE 1: For creating a comment on a post using POST: /api/comment/createcomment/:postId, login required
router.post(
  "/createcomment/:postId",
  fetchuser,
  [body("text", "There should be some content in the comment").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const postId = req.params.postId;
      const post = await Post.findById(postId);

      if (!post) {
        return res
          .status(400)
          .json({ error: "Please comment on a valid post" });
      }

      const newComment = new Comment({
        text: req.body.text,
        author: req.user.id, // Save the user associated with the comment
        post: postId,
      });

      await newComment.save();

      // Push the new comment's _id into the post's comments array
      post.comments.push(newComment._id);
      await post.save();

      res.json(newComment);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ROUTE 2: Editing a comment using PUT: /api/comment/editcomment/:commentId
router.put("/editcomment/:commentId", fetchuser, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const updatedText = req.body.text;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(400).json({ error: "Comment not found" });
    }

    if (!comment.author) {
      return res.status(400).json({ error: "User not found for this comment" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You're not allowed to edit this comment" });
    }

    comment.text = updatedText;
    await comment.save();

    res.json(comment);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ROUTE 3: For replying to a comment using POST: /api/comment/replytocomment/:commentId
router.post(
  "/replytocomment/:commentId",
  fetchuser,
  [body("text", "There should be some content in the reply").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const commentId = req.params.commentId;
      const parentComment = await Comment.findById(commentId);

      if (!parentComment) {
        return res.status(400).json({ error: "Parent comment not found" });
      }

      const newReply = new Comment({
        text: req.body.text,
        author: req.user.id, // Save the user associated with the reply
        post: parentComment.post,
        parentComment: commentId,
      });

      await newReply.save();

      res.json(newReply);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ROUTE - 4 : Get all the replies to a particular comment using GET : /api/comment/:id, login required
router.get("/getreplies/:id", fetchuser, async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(400).json({ error: "No such comment exists" });
    }
    const replies = Comment.find({ parentComment: commentId });
    if (replies.isEmpty()) {
      return res.json({ message: "No replies yet" });
    }
    res.json(replies);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ROUTE 5 : Deleting a particular comment using : DELETE /api/comment/deletecomment/:id, login required
router.delete("/deletecomment/:id", fetchuser, async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(400).json({ error: "No such comment exists" });
    }

    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You're not authorized to delete this comment" });
    }

    // Delete the comment and its replies
    await Comment.deleteMany({
      $or: [{ _id: comment._id }, { parentComment: commentId }],
    });

    res.json({ message: "Comment and its replies deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
