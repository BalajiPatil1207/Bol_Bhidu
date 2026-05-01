import { XIcon, ArrowLeft, Phone, Video, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, selectedGroup, setSelectedGroup, typingUsers, messageSearchQuery, setMessageSearchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { handleCallUser } = useCallStore();
  const [showSearch, setShowSearch] = useState(false);
  
  const isOnline = onlineUsers.includes(selectedUser?._id);
  const isTyping = typingUsers[selectedUser?._id];

  const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const lastSeenDate = new Date(date);
    const now = new Date();
    const diffInMs = now - lastSeenDate;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMins < 1) return "Last seen just now";
    if (diffInMins < 60) return `Last seen ${diffInMins}m ago`;
    if (diffInHours < 24) return `Last seen ${diffInHours}h ago`;
    return `Last seen on ${lastSeenDate.toLocaleDateString()}`;
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  const handleClose = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  if (!selectedUser && !selectedGroup) return null;

  const displayInfo = selectedUser || selectedGroup;
  const isGroup = !!selectedGroup;

  return (
    <div
      className="flex justify-between items-center glass-header px-4 min-h-[72px]"
    >
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        <button
          onClick={handleClose}
          className="md:hidden p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <ArrowLeft className="size-6" />
        </button>

        <div className="relative group">
          <div className="size-11 rounded-full overflow-hidden border-2 border-[var(--accent-color)]/20 shadow-lg">
            <img 
              src={(isGroup ? selectedGroup.groupAvatar : selectedUser.profilePic) || "/avatar.png"} 
              alt={isGroup ? selectedGroup.name : selectedUser.fullName} 
              className="size-full object-cover"
            />
          </div>
          {!isGroup && isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-[var(--accent-color)] border-2 border-[var(--bg-surface)] rounded-full" />
          )}
        </div>

        <div>
          <h3 className="text-[var(--text-main)] font-bold text-sm tracking-tight leading-none mb-1.5">
            {isGroup ? selectedGroup.name : selectedUser.fullName}
          </h3>
          {isTyping ? (
            <p className="text-[var(--accent-color)] text-[10px] font-bold uppercase tracking-widest animate-pulse">
              Typing...
            </p>
          ) : (
            <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
              {isGroup ? `${selectedGroup.members.length} members` : (isOnline ? "Online" : formatLastSeen(selectedUser.lastSeen))}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Message Search Toggle */}
        <div className={`flex items-center gap-2 ${showSearch ? "bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-full px-3 py-1 animate-in slide-in-from-right duration-300" : ""}`}>
            {showSearch && (
                <input 
                    autoFocus
                    type="text"
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="bg-transparent border-none outline-none text-xs w-32 md:w-48 text-[var(--text-main)]"
                />
            )}
            <button 
                onClick={() => {
                    setShowSearch(!showSearch);
                    if (showSearch) setMessageSearchQuery("");
                }}
                className={`p-2 rounded-full transition-all ${showSearch ? "text-[var(--accent-color)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"}`}
                title="Search Messages"
            >
                <Search className="size-5" />
            </button>
        </div>

        {/* Call Buttons (Only for individual chats) */}
        {!isGroup && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleCallUser(selectedUser._id, "audio")}
              className="p-2.5 text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 rounded-full transition-all"
              title="Audio Call"
            >
              <Phone className="size-5" />
            </button>
            <button
              onClick={() => handleCallUser(selectedUser._id, "video")}
              className="p-2.5 text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 rounded-full transition-all"
              title="Video Call"
            >
              <Video className="size-5" />
            </button>
          </div>
        )}

        <div className="hidden md:block w-[1px] h-6 bg-[var(--border-color)] mx-1" />

        <button 
          onClick={handleClose}
          className="hidden md:flex p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)] rounded-full transition-all"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
