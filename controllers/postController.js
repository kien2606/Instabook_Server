const Posts = require("../models/postModel");
const Comments = require("../models/commentModel");
const Users = require("../models/userModel");

const mongoose = require("mongoose");

const shuffleArray = require("../utils/shuffledArray");

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 4;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

let userDiscoveryPost = {};

const postController = {
  createPost: async (req, res) => {
    try {
      const { content, images } = req.body;
      const newPost = new Posts({
        content,
        images,
        user: req.user._id,
      });
      await newPost.save();
      res.json({
        msg: "Create success",
        post: { ...newPost._doc, user: req.user },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPosts: async (req, res) => {
    try {
      const features = new ApiFeatures(
        Posts.find({
          user: [...req.user.following, req.user._id],
        }),
        req.query
      ).paginating();
      const posts = await features.query
        .sort("-createdAt")
        .populate("user likes", "avatar fullname username followers")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "avatar fullname username",
          },
        });

      res.json({
        msg: "Success",
        posts,
        total_posts: posts.length,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { content, images } = req.body;
      const post = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        { content, images }
      )
        .populate("user likes", "avatar username fullname")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "avatar fullname username",
          },
        });
      res.json({
        msg: "Updated post",
        newPost: {
          ...post._doc,
          content,
          images,
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  likePost: async (req, res) => {
    try {
      const like = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { likes: req.user._id },
        }
      );
      if (!like)
        return res.status(400).json({ msg: "This post does not exist" });
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unLikePost: async (req, res) => {
    try {
      const unlike = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { likes: req.user._id },
        }
      );
      if (!unlike) {
        return res.status(400).json({ msg: "This post does not exist" });
      }
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deletePost: async (req, res) => {
    try {
      const post = await Posts.findOneAndDelete({ _id: req.params.id });
      await Comments.deleteMany({ _id: { $in: post.comments } });
      res.json({
        msg: "Success",
        post: {
          ...post._doc,
          user: req.user,
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUserPosts: async (req, res) => {
    try {
      const posts = await Posts.find({ user: req.params.id });
      res.json({ posts, totalPost: posts.length });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPost: async (req, res) => {
    // specific_post
    try {
      const post = await Posts.findById(req.params.id)
        .populate("user likes", "avatar fullname username followers ")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });
      if (!post) {
        return res.status(400).json({ msg: "This post does not exist" });
      }
      res.json({ post });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getDiscoverPost: async (req, res) => {
    try {
      // const features = new ApiFeatures(
      //   Posts.find({
      //     user: { $nin: [...req.user.following, req.user._id] },
      //   }),
      //   req.query
      // ).paginating();
      // const { page, limit } = req.query;
      // const posts = await Posts.find({
      //   user: { $nin: [...req.user.following, req.user._id] },
      // })
      //   .sort("-createdAt")
      //   .populate("user likes", "avatar fullname username")
      //   .populate({
      //     path: "comments",
      //     populate: {
      //       path: "user likes",
      //       select: "avatar fullname username",
      //     },
      //   });

      // shuffleArray(posts);
      // // const skip = (page - 1) * limit;
      // // await posts.skip(skip).limit(limit);
      // res.json({
      //   msg: "Success",
      //   posts,
      //   total_posts: posts.length,
      // });

      // -----------------------Random Post Field--------------------------------
      const { isFirstLoad, page, limit } = req.query;
      const start = (Number(page) - 1) * Number(limit);
      const end = start + Number(limit);
      // console.log({ isFirstLoad, page, limit });

      if (isFirstLoad === "true") {
        if (userDiscoveryPost[req.user._id]) {
          userDiscoveryPost[req.user._id] = [];
        }
        const posts = await Posts.find({
          user: { $nin: [...req.user.following, req.user._id] },
        })
          .sort("-createdAt")
          .populate("user likes", "avatar fullname username")
          .populate({
            path: "comments",
            populate: {
              path: "user likes",
              select: "avatar fullname username",
            },
          });

        shuffleArray(posts);
        userDiscoveryPost[req.user._id] = [...posts];
        const filterTitle = posts.map((post) => post.content);
        console.log("is still catch");
        console.log({ filterTitle });
        const sendData = userDiscoveryPost[req.user._id].slice(start, end);
        // const sendDataTitle = sendData.map((a) => a.content);
        res.json({
          msg: "Success",
          posts: sendData,
        });
      } else {
        const sendData = userDiscoveryPost[req.user._id].slice(start, end);
        // const sendDataTitle = sendData.map((a) => a.content);
        res.json({
          msg: "Success",
          posts: sendData,
        });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  savePost: async (req, res) => {
    try {
      const save = await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: { savedPost: req.params.id },
        },
        { new: true }
      );
      if (!save)
        return res.status(400).json({ msg: "This user does not exist" });
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unSavePost: async (req, res) => {
    try {
      const unSave = await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          $pull: { savedPost: req.params.id },
        },
        { new: true }
      );
      if (!unSave)
        return res.status(400).json({ msg: "This user does not exist" });
      res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getSavePost: async (req, res) => {
    try {
      const posts = await Posts.find({ _id: { $in: req.user.savedPost } });
      res.json({ posts, totalPost: posts.length });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = postController;
