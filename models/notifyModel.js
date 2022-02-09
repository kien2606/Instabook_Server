const mongoose = require("mongoose");

const notifyModel = new mongoose.Schema(
  {
    id: mongoose.Types.ObjectId, // the id of something that makes the notification
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    recipients: [mongoose.Types.ObjectId],
    url: String,
    text: String,
    // isRead: { type: Boolean, default: false },
    unread: [{ type: mongoose.Types.ObjectId }], // array who isn't read the notifications // default is recipients array
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("notify", notifyModel);
