import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:9876";
let socket;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token,
        actorType: "user",
      },
    });
  }
  return socket;
};

export const getSocket = () => socket;
