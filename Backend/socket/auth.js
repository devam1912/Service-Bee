// Backend/socket/auth.js
export const socketAuth = async (socket, next) => {
  socket.actor = {
    id: "000000000000000000000001",
    type: "User",
  };
  next();
};
