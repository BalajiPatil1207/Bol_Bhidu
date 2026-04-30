import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, selectedUser, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between group relative ${
            selectedUser?._id === chat._id 
              ? "bg-emerald-500/10 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20" 
              : "hover:bg-white/5"
          }`}
          onClick={() => setSelectedUser(chat)}
        >
          {selectedUser?._id === chat._id && (
            <div className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          )}

          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative">
              <div className="size-13 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-emerald-500/50 transition-all duration-300">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} className="size-full object-cover" />
              </div>
              {onlineUsers.includes(chat._id) && (
                <div className="absolute bottom-0 right-0 size-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full shadow-md" />
              )}
            </div>
            
            <div className="min-w-0">
              <h4 className={`text-slate-100 font-bold tracking-tight truncate ${selectedUser?._id === chat._id ? "text-emerald-400" : ""}`}>
                {chat.fullName}
              </h4>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                {onlineUsers.includes(chat._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Unread Count Badge */}
            {unreadCounts[chat._id] > 0 && (
              <div className="bg-emerald-500 text-white text-[10px] font-black min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-300">
                {unreadCounts[chat._id]}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
