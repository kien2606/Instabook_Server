let users = [];

const SocketServer = (socket) => {
  // connection-disconnection
  socket.on("join_user", (id) => {
    users.push({ id, socketId: socket.id });
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
  });

  // like post

  socket.on("like_post", (post) => {
    const allIdFollowingPost = [...post.user.followers, post.user._id];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("like_to_client", post);
      });
    }
  });

  // unlike post

  socket.on("unlike_post", (post) => {
    const allIdFollowingPost = [...post.user.followers, post.user._id];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("unlike_to_client", post);
      });
    }
  });

  // create comment post

  socket.on("create_comment", (post) => {
    const allIdFollowingPost = [...post.user.followers, post.user._id];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("create_comment_to_client", post);
      });
    }
  });

  // delete comment
  socket.on("delete_comment", (post) => {
    const allIdFollowingPost = [...post.user.followers, post.user._id];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("delete_comment_to_client", post);
      });
    }
  });

  // like comment

  socket.on("like_comment", (post) => {
    const allIdFollowingPost = [...post.user.followers, post.user._id];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("like_comment_to_client", post);
      });
    }
  });

  // unlike comment

  socket.on("unlike_comment", (post) => {
    const allIdFollowingPost = [...post.user.followers, post.user._id];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("unlike_comment_to_client", post);
      });
    }
  });

  //follow

  socket.on("follow", (userId, addFollowing, addFollower) => {
    const currentUser = users.find((user) => user.id === addFollower._id);
    currentUser &&
      socket
        .to(`${currentUser.socketId}`)
        .emit("follow_to_client", userId, addFollowing);
  });

  //un follow
  socket.on("unfollow", (userId, removeFollowing, removeFollower) => {
    const currentUser = users.find((user) => user.id === removeFollower._id);
    currentUser &&
      socket
        .to(`${currentUser.socketId}`)
        .emit("unfollow_to_client", userId, removeFollowing);
  });

  // create notify

  socket.on("create_notify", (msg) => {
    const allIdFollowingPost = [...msg.recipients];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("create_notify_to_client", msg);
      });
    }
  });

  // delete notify

  socket.on("delete_notify", (msg) => {
    const allIdFollowingPost = [...msg.recipients];
    const clients = users.filter((user) =>
      allIdFollowingPost.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((cl) => {
        socket.to(`${cl.socketId}`).emit("delete_notify_to_client", msg);
      });
    }
  });

  // send message

  socket.on("send_message", (msg) => {
    console.log(msg);
    const user = users.find((user) => user.id === msg.recipient);
    user && socket.to(`${user.socketId}`).emit("send_message_to_client", msg);
  });
};

module.exports = SocketServer;
