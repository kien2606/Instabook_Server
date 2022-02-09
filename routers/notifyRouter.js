const router = require("express").Router();
const auth = require("../middlewares/auth");
const notifyController = require("../controllers/notifyController");

router.get("/notifies", auth, notifyController.getNotifies);
router.post("/notify", auth, notifyController.createNotify);
router.delete("/notify/:id", auth, notifyController.deleteNotify);
router.patch("/read_notifies/:id", auth, notifyController.readNotifies);
router.delete("/delete_all_notifies", auth, notifyController.deleteAllNotifies);

module.exports = router;
