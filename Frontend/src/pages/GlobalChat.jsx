import { useEffect, useRef, useState } from "react";
import { connectSocket } from "../lib/socket";

const currentUser = JSON.parse(localStorage.getItem("servicebee_user"));

export default function GlobalChat() {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const socket = connectSocket("public");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:global");
    });

    socket.on("global:newMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off("global:newMessage");
      socket.disconnect();
    };
  }, []);

  const send = () => {
    if (!text.trim()) return;
    socketRef.current.emit("sendGlobalMessage", { text });
    setText("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🌍 Global Chat</h1>

      {/* CHAT BOX */}
      <div className="h-96 rounded-lg p-4 overflow-y-auto space-y-2
        bg-neutral-100 dark:bg-neutral-900">

        {messages.map((m) => {
          const isMine =
            String(m.senderId) === String(currentUser?._id);

          return (
            <div
              key={m._id}
              className={`max-w-[70%] px-3 py-2 rounded-lg text-sm
                ${isMine
                  ? "ml-auto bg-yellow-400 text-black"
                  : "mr-auto bg-neutral-700 text-white"
                }`}
            >
              {m.text}
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="flex-1 rounded border px-3 py-2
            bg-white dark:bg-neutral-800
            text-black dark:text-white"
          placeholder="Type message…"
        />
        <button
          onClick={send}
          className="bg-yellow-400 px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
