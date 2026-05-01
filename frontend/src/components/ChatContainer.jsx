import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { CheckCheck, MoreVertical, Trash2, Edit2 } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    selectedGroup,
    getMessagesByUserId,
    getGroupMessages,
    messages,
    isMessagesLoading,
    markMessagesAsSeen,
    toggleReaction,
    editMessage,
    deleteMessage,
    messageSearchQuery,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
      markMessagesAsSeen(selectedUser._id);
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedUser, selectedGroup, getMessagesByUserId, getGroupMessages, markMessagesAsSeen]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  return (
    <>
      <ChatHeader />
      <div className="flex-1 overflow-y-auto min-h-0 relative bg-[#0b141a]">
        {/* WhatsApp Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
            backgroundRepeat: "repeat",
            backgroundSize: "400px",
          }}
        />

        <div className="relative z-10 p-4 min-h-full flex flex-col">
          {messages.length > 0 && !isMessagesLoading ? (
            <div className="flex flex-col space-y-2">
            {messages
              .filter(msg => msg.text?.toLowerCase().includes(messageSearchQuery.toLowerCase()))
              .map((msg) => {
              const isMe = (msg.senderId._id || msg.senderId) === authUser._id;
              return (
              <div
                key={msg._id}
                className={`flex w-full gap-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && selectedGroup && (
                  <div className="size-8 rounded-full overflow-hidden self-end mb-1 shrink-0">
                    <img 
                        src={msg.senderId?.profilePic || "/avatar.png"} 
                        alt={msg.senderId?.fullName} 
                        className="size-full object-cover" 
                    />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm relative group ${
                    msg.isDeleted ? "bg-opacity-50 italic" : ""
                  } ${
                    isMe
                      ? "bg-[var(--accent-color)] text-white"
                      : "bg-[var(--bg-elevated)] text-[var(--text-main)]"
                  }`}
                >
                  {!isMe && selectedGroup && (
                    <p className="text-[11px] font-black text-[var(--accent-color)] mb-0.5">
                      {msg.senderId?.fullName}
                    </p>
                  )}
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-md max-h-60 w-full object-cover mb-1" />
                  )}
                  {msg.file && (
                    <a 
                        href={msg.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-black/10 p-3 rounded-lg mb-1 hover:bg-black/20 transition-colors border border-white/10"
                    >
                        <div className="p-2 bg-[var(--accent-color)] rounded-lg text-white">
                            <FileText className="size-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{msg.text || "Shared File"}</p>
                            <p className="text-[10px] opacity-60 uppercase">{msg.fileType?.split("/")[1] || "File"}</p>
                        </div>
                    </a>
                  )}
                  {msg.audio && !msg.isDeleted && (
                    <div className="mb-1 min-w-[240px]">
                      <audio 
                        src={msg.audio} 
                        controls 
                        className={`w-full h-8 ${isMe ? "brightness-110" : ""}`}
                      />
                    </div>
                  )}
                  {msg.text && (
                    <p className={`text-[14.2px] leading-tight whitespace-pre-wrap ${!msg.isDeleted ? "pr-16" : "pr-4 opacity-70"}`}>
                        {msg.text}
                        {msg.isEdited && !msg.isDeleted && <span className="text-[10px] ml-2 opacity-50">(edited)</span>}
                    </p>
                  )}
                  
                  {/* Reactions Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 -mb-1">
                      {msg.reactions.map((r, idx) => (
                        <div 
                          key={idx} 
                          className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-full px-1.5 py-0.5 text-xs shadow-sm flex items-center gap-1 scale-90 origin-left"
                          title={r.userId?.fullName || "User"}
                        >
                          <span>{r.emoji}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 absolute bottom-1 right-2">
                    <p className="text-[10px] opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    {isMe && (
                      <CheckCheck 
                        className={`size-3.5 ${msg.isSeen ? "text-[#53bdeb]" : "text-slate-400 opacity-60"}`} 
                      />
                    )}
                  </div>

                  {/* Reaction Picker on Hover (Desktop only for now) */}
                  {!msg.isDeleted && (
                    <div className={`absolute top-0 ${isMe ? "-left-12" : "-right-12"} opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-full px-2 py-1 shadow-xl z-50 flex gap-1.5 scale-90`}>
                        {REACTION_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => toggleReaction(msg._id, emoji)}
                            className="hover:scale-125 transition-transform duration-200"
                        >
                            {emoji}
                        </button>
                        ))}
                    </div>
                  )}

                  {/* Options Menu for My Messages */}
                  {isMe && !msg.isDeleted && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity dropdown dropdown-left">
                      <label tabIndex={0} className="p-1 hover:bg-black/10 rounded-full cursor-pointer transition-colors block">
                        <MoreVertical className="size-4 opacity-60" />
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[100] menu p-1 shadow-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl w-32">
                        <li>
                          <button 
                            onClick={() => {
                                const newText = prompt("Edit your message:", msg.text);
                                if (newText && newText !== msg.text) editMessage(msg._id, newText);
                            }}
                            className="flex items-center gap-2 py-2 hover:bg-[var(--accent-color)]/10 text-[var(--text-main)]"
                          >
                            <Edit2 className="size-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => {
                                if (confirm("Delete this message?")) deleteMessage(msg._id);
                            }}
                            className="flex items-center gap-2 py-2 hover:bg-red-500/10 text-red-500"
                          >
                            <Trash2 className="size-4" />
                            <span className="text-sm">Delete</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName || selectedGroup?.name} />
        )}
        </div>
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
