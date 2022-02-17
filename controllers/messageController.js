const Conversations = require("../models/conversationModel");
const Messages = require("../models/messageModel");

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 15;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const messageController = {
  createMessage: async (req, res) => {
    try {
      const { text, images, sender, recipient } = req.body;
      if (!recipient || (!text.trim() && images.length === 0)) return;
      const newConversation = await Conversations.findOneAndUpdate(
        {
          $or: [
            { recipients: [sender, recipient] },
            { recipients: [recipient, sender] },
          ],
        },
        {
          recipients: [sender, recipient],
          text,
          images,
        },
        { new: true, upsert: true }
      );
      const newMessage = new Messages({
        conversation: newConversation._id,
        sender,
        recipient,
        text,
        images,
      });
      await newMessage.save();
      return res.json({ msg: "Success" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getConversations: async (req, res) => {
    try {
      const features = new ApiFeatures(
        Conversations.find({
          recipients: req.user._id,
        }),
        req.query
      ).paginating();
      const conversations = await features.query
        .sort("updatedAt")
        .populate("recipients", "avatar username fullname");
      return res.json({ conversations });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getMessages: async (req, res) => {
    try {
      const features = new ApiFeatures(
        Messages.find({
          $or: [
            { sender: req.user._id, recipient: req.params.id },
            { sender: req.params.id, recipient: req.user._id },
          ],
        }),
        req.query
      ).paginating();
      const messages = await features.query.sort("-createdAt");
      const convertTimeMessages = messages.map((message) => {
        const date = new Date(message.createdAt);
        return { ...message._doc, createdAt: date.toLocaleString("en-US") };
      });

      return res.json({ messages: convertTimeMessages });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = messageController;
