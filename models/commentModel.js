const mongoose = require("mongoose");

const commentModel = new mongoose.Schema(
  {
    content: { type: String },
    tag: { type: Object },
    reply: { type: mongoose.Types.ObjectId },
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    postId: { type: mongoose.Types.ObjectId },
   },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comment", commentModel);
