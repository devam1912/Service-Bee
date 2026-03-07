import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:9876";

export const useSocket = () => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (user && !socketRef.current) {
            const socketInstance = io(SOCKET_URL, {
                auth: {
                    token: localStorage.getItem("token"),
                },
            });

            socketInstance.on("connect", () => {
                console.log("Connected to socket server");
            });

            socketInstance.on("connect_error", (err) => {
                console.error("Socket connection error:", err);
            });

            socketRef.current = socketInstance;
            setSocket(socketInstance);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [user]);

    return socket;
};
