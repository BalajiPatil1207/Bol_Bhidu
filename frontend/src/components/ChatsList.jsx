import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList({ searchQuery = "" }) {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  const filteredChats = chats.filter(chat => 
    chat.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (chats.length === 0) return <NoChatsFound />;
  if (filteredChats.length === 0) return <div className="p-4 text-center text-sm text-[var(--text-muted)]">No chats match "{searchQuery}"</div>;

  return (
    <>
      {filteredChats.map((chat) => (
        <div
          key={chat._id}
          className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between group relative ${
            selectedUser?._id === chat._id 
              ? "bg-[var(--accent-color)]/10 shadow-lg shadow-[var(--accent-color)]/5 ring-1 ring-[var(--accent-color)]/20" 
              : "hover:bg-[var(--bg-elevated)]"
          }`}
          onClick={() => setSelectedUser(chat)}
        >
          {selectedUser?._id === chat._id && (
            <div className="absolute left-0 w-1 h-8 bg-[var(--accent-color)] rounded-r-full shadow-[0_0_8px_var(--accent-color)]" />
          )}

          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative">
              <div className="size-13 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-[var(--accent-color)]/50 transition-all duration-300">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} className="size-full object-cover" />
              </div>
              {onlineUsers.includes(chat._id) && (
                <div className="absolute bottom-0 right-0 size-3.5 bg-[var(--accent-color)] border-2 border-[var(--bg-surface)] rounded-full shadow-md" />
              )}
            </div>
            
            <div className="min-w-0">
              <h4 className={`text-[var(--text-main)] font-bold tracking-tight truncate ${selectedUser?._id === chat._id ? "text-[var(--accent-color)]" : ""}`}>
                {chat.fullName}
              </h4>
              <p className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest mt-0.5">
                {onlineUsers.includes(chat._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Unread Count Badge */}
            {chat.unreadCount > 0 && (
              <div className="bg-[var(--accent-color)] text-white text-[10px] font-black min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent-color)]/20 animate-in zoom-in duration-300">
                {chat.unreadCount}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
