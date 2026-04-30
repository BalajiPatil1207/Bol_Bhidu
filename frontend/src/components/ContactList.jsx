import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 group relative ${
            selectedUser?._id === contact._id 
              ? "bg-emerald-500/10 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20" 
              : "hover:bg-white/5"
          }`}
          onClick={() => setSelectedUser(contact)}
        >
          {selectedUser?._id === contact._id && (
            <div className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          )}

          <div className="relative">
            <div className="size-13 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-emerald-500/50 transition-all duration-300">
              <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} className="size-full object-cover" />
            </div>
            {onlineUsers.includes(contact._id) && (
              <div className="absolute bottom-0 right-0 size-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full shadow-md" />
            )}
          </div>
          
          <div className="min-w-0">
            <h4 className={`text-slate-100 font-bold tracking-tight truncate ${selectedUser?._id === contact._id ? "text-emerald-400" : ""}`}>
              {contact.fullName}
            </h4>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-0.5">
              Available
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
export default ContactList;
