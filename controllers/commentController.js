const Comments = require("../models/commentModel");
const Posts = require("../models/postModel");
const commentController = {
  createComment: async (req, res) => {
    try {
      const { postId, content, tag, reply, postUserId } = req.body;
      const post = await Posts.findById(postId);
      if (!post)
        return res.status(400).json({ msg: "This post does not exist" });
      const newComment = new Comments({
        user: req.user._id,
        content,
        tag,
        reply,
        postId,
      });
      await Posts.findOneAndUpdate(
        { _id: postId },
        {
          $push: { comments: newComment },
        },
        { new: true }
      );
      await newComment.save();
      res.json({ newComment });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  likeComment: async (req, res) => {
    try {
      await Comments.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { likes: req.user._id },
        },
        { new: true }
      );
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unLikeComment: async (req, res) => {
    try {
      await Comments.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { likes: req.user._id },
        }
      );
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.messae });
    }
  },
  updateComment: async (req, res) => {
    try {
      const { content } = req.body;
      await Comments.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { content }
      );
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteComment: async (req, res) => {
    try {
      const comment = await Comments.findOneAndDelete({ _id: req.params.id });
      await Posts.findOneAndUpdate(
        { _id: comment.postId },
        {
          $pull: { comments: req.params.id },
        }
      );
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = commentController;
