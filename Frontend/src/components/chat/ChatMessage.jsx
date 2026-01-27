export default function ChatMessage({ msg }) {
  const roleColor =
    msg.senderType === "Admin"
      ? "text-red-500"
      : msg.senderType === "Company"
      ? "text-blue-500"
      : "text-green-500";

  return (
    <div className="px-4 py-1">
      <span className={`font-semibold ${roleColor}`}>
        {msg.senderType}
      </span>
      <span className="mx-2 text-gray-400">•</span>
      <span>{msg.text}</span>
    </div>
  );
}
