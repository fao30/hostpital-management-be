const socketIO = require("socket.io");
const userService = require("./api/service/userService");
const { PATIENT } = require("./api/constants/roles.const");

let io;
const onlineUsers = new Map();

function setupSocketIO(server) {
  io = socketIO(server, {
    path: "/socket.io/",
  });

  io.on("connection", (socket) => {
    socket.on("myEvent", (data) => {
      console.log(socket.id);
      console.log("Received data from client:", data);
      // You can perform any desired actions here
    });

    socket.on("add-socket-id", async (email) => {
      const user = await userService.findOneUser(email);
      if (user?.role_id !== PATIENT && !user.socket_id) {
        user.socket_id = socket.id;
        user.save();
        onlineUsers.set(socket.id, user.id);
      }
    });

    socket.on("disconnect", async () => {
      console.log("A client disconnected");
      if (onlineUsers.has(socket.id)) {
        //HAPUS DI DB JUGA
        // const user = await userService.findOneUser();
        console.log(
          socket.id,
          "<<<<<<============ THIS IS DISSCCONETCT socket.id"
        );
        const userId = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id);

        const user = await userService.findUserBySocketId(socket.id);
        console.log(user, "<<<< THIS IS USER");
        if (user) {
          user.socket_id = null;
          user.save();
        }
        console.log(`User ${userId} disconnected`);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });
  });

  return io;
}

module.exports = { setupSocketIO };
