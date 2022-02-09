const Notifies = require("../models/notifyModel");

const notifyController = {
  createNotify: async (req, res) => {
    try {
      const { id, recipients, url, text } = req.body;
      if (recipients.includes(req.user._id.toString())) return;
      const notify = new Notifies({
        id,
        recipients,
        url,
        text,
        user: req.user._id,
        unread: recipients,
      });
      await notify.save();
      res.json({ notify });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteNotify: async (req, res) => {
    try {
      const notify = await Notifies.findOneAndRemove({ id: req.params.id });
      return res.json({ notify });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getNotifies: async (req, res) => {
    try {
      const notifies = await Notifies.find({ recipients: req.user._id })
        .sort("-createdAt")
        .populate("user", "avatar username");
      return res.json({ notifies });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  readNotifies: async (req, res) => {
    try {
      const notifies = await Notifies.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { unread: req.user._id },
        }
      );
      return res.json({ notifies });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteAllNotifies: async (req, res) => {
    try {
      const notifies = await Notifies.updateMany({
        $pull: { recipients: req.user._id },
      });
      return res.json({ notifies });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = notifyController;
