import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Send, Sparkles, MessageSquare } from "lucide-react";

import api from "../utils/api";
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
      const res = await api.get("/api/global-chat/messages");
      setMessages(res.data.data || []);
      setTimeout(scrollToBottom, 100);
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
    <div className="h-[700px] flex flex-col relative max-w-5xl mx-auto">
      <ChatDisclaimer />
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-petal-rose/10 p-4 rounded-2xl">
            <MessageSquare className="w-8 h-8 text-petal-rose" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-black text-petal-leaf dark:text-white tracking-tight">
              Global Hive
            </h2>
            <p className="text-gray-500 font-medium font-sans">Connect with the local hive in real-time</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-900/30">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Hive Online</span>
        </div>
      </div>

      <Card className="flex-grow flex flex-col p-0 overflow-hidden relative min-h-0 bg-white dark:bg-petal-muted/20 border-none shadow-2xl rounded-[40px]">
        {/* Subtle honeycomb pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#FF8E9C 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
        </div>

        <div className="flex-grow overflow-y-auto space-y-6 p-8 mb-4 pr-12 scrollbar-none min-h-0">
          {messages.map((msg, idx) => {
            const isMe = String(msg.senderId?._id) === String(user._id) || String(msg.sender?._id) === String(user._id);
            const senderName = msg.senderId?.name || msg.sender?.name || (isMe ? "Me" : "Unknown");

            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className={`flex flex-col ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
                    {isMe ? "Sent by You" : senderName}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-[24px] px-6 py-4 relative shadow-sm
                      ${isMe
                        ? "bg-petal-leaf dark:bg-petal-rose text-white dark:text-deep-moss rounded-tr-none font-medium"
                        : "bg-gray-50 dark:bg-petal-muted/30 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-petal-leaf/5"}`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text || msg.content}</p>
                    <div className="text-[9px] font-bold opacity-40 mt-2 uppercase tracking-tighter">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-gray-50 dark:bg-petal-muted/40 border-t border-gray-100 dark:border-petal-leaf/5">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            <div className="flex-grow relative group">
              <Input
                className="w-full !py-4 pl-6 rounded-2xl border-none shadow-xl focus:ring-petal-rose bg-white dark:bg-deep-moss"
                placeholder="Message the hive..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Sparkles size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-petal-rose opacity-40 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <Button type="submit" variant="primary" className="!p-4 rounded-2xl shadow-petal-rose/20 bg-petal-rose text-white border-none">
              <Send size={24} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

