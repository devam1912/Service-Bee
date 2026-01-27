import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2 p-3 border-t">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-900"
      />
      <button className="px-4 rounded-lg bg-black text-white dark:bg-white dark:text-black">
        Send
      </button>
    </form>
  );
}
