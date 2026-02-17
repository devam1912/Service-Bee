import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Send, Ghost } from "lucide-react";

import axios from "axios";
import ChatDisclaimer from "../components/ChatDisclaimer";

export default function GlobalChat() {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit("join:global");

      socket.on("global:newMessage", (msg) => {
        console.log("📥 global:newMessage received:", msg);
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      });
    }

    return () => {
      if (socket) {
        socket.off("global:newMessage");
      }
    };
  }, [socket]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:9876/api/global-chat/messages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data || []);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit("sendGlobalMessage", { text: newMessage });
    setNewMessage("");
  };

  return (
    <div className="h-[600px] flex flex-col relative">
      <ChatDisclaimer />
      <div className="mb-4">
        <h2 className="text-3xl font-spooky text-white flex items-center gap-2">
          <Ghost className="animate-float" /> Spirit Box
        </h2>
        <p className="text-gray-400">Communicate with the other side...</p>
      </div>

      <Card className="flex-grow flex flex-col p-4 overflow-hidden relative min-h-0">
        {/* Spooky background pattern inside chat */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#7c3aed 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar min-h-0">
          {messages.map((msg, idx) => {
            const isMe = String(msg.senderId?._id) === String(user._id) || String(msg.sender?._id) === String(user._id);
            const senderName = msg.senderId?.name || msg.sender?.name || (isMe ? "Me" : "Unknown");

            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 relative break-words whitespace-pre-wrap
                    ${isMe
                      ? "bg-spooky-purple text-white rounded-br-none"
                      : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"}`}
                >
                  {/* Sender Name */}
                  {!isMe && (
                    <p className="text-xs text-spooky-orange font-bold mb-1">{senderName}</p>
                  )}

                  <p>{msg.text || msg.content}</p>
                  <div className="text-[10px] opacity-50 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Tail for speech bubble */}
                  <div className={`absolute bottom-0 w-3 h-3 
                    ${isMe
                      ? "-right-1 bg-spooky-purple clip-path-triangle-right"
                      : "-left-1 bg-gray-800 clip-path-triangle-left"}`}
                  />
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2 relative z-10 pt-2 border-t border-gray-800">
          <Input
            className="flex-grow"
            placeholder="Whisper into the void..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" variant="primary" className="px-4">
            <Send size={20} />
          </Button>
        </form>
      </Card>
    </div>
  );
}
