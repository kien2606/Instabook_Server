require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const SocketServer = require("./socketServer");

const app = express();

const authRouter = require("./routers/authRouter");
const userRouter = require("./routers/userRouter");
const postRouter = require("./routers/postRouter");
const commentRouter = require("./routers/commentRouter");
const notifyRouter = require("./routers/notifyRouter");

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// socket
const http = require("http").createServer(app);
const io = require("socket.io")(http);
io.on("connection", (socket) => {
  SocketServer(socket);
});

// Routers
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", postRouter);
app.use("/api", commentRouter);
app.use("/api", notifyRouter);

const URI = process.env.MONGODB_URL;
mongoose.connect(
  URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connect to mongodb");
  }
);
const port = process.env.PORT || 5000;

http.listen(port, () => {
  console.log("Server is running on port ", port);
});
