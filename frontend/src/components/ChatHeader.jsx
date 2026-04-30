import { XIcon, ArrowLeft, Phone, Video } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { handleCallUser } = useCallStore();
  
  const isOnline = onlineUsers.includes(selectedUser?._id);
  const isTyping = typingUsers[selectedUser?._id];

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  return (
    <div
      className="flex justify-between items-center glass-header px-4 min-h-[72px]"
    >
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-6" />
        </button>

        <div className="relative group">
          <div className="size-11 rounded-full overflow-hidden border-2 border-emerald-500/20 shadow-lg">
            <img 
              src={selectedUser.profilePic || "/avatar.png"} 
              alt={selectedUser.fullName} 
              className="size-full object-cover"
            />
          </div>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
          )}
        </div>

        <div>
          <h3 className="text-slate-100 font-bold text-sm tracking-tight leading-none mb-1.5">
            {selectedUser.fullName}
          </h3>
          {isTyping ? (
            <p className="text-[#00a884] text-[10px] font-bold uppercase tracking-widest animate-pulse">
              Typing...
            </p>
          ) : (
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Call Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleCallUser(selectedUser._id, "audio")}
            className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all"
            title="Audio Call"
          >
            <Phone className="size-5" />
          </button>
          <button
            onClick={() => handleCallUser(selectedUser._id, "video")}
            className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all"
            title="Video Call"
          >
            <Video className="size-5" />
          </button>
        </div>

        <div className="hidden md:block w-[1px] h-6 bg-white/5 mx-1" />

        <button 
          onClick={() => setSelectedUser(null)}
          className="hidden md:flex p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
