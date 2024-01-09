const socketIO = require("socket.io");
const userService = require("./api/service/userService");
const { PATIENT } = require("./api/constants/roles.const");

let io;
const onlineUsers = new Map();

function setupSocketIO(server) {
  io = socketIO(server);

  io.on("connection", (socket) => {
    console.log("A client connected mantapp--------->>>>>>>>>>>>");

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

    socket.on("disconnect", () => {
      console.log("A client disconnected");
      if (onlineUsers.has(socket.id)) {
        //HAPUS DI DB JUGA
        // const user = await userService.findOneUser();
        const userId = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id);
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
