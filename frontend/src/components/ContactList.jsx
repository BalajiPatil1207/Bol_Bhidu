import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList({ searchQuery = "" }) {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  const filteredContacts = allContacts.filter(contact => 
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredContacts.length === 0) return <div className="p-4 text-center text-sm text-[var(--text-muted)]">No contacts match "{searchQuery}"</div>;

  return (
    <>
      {filteredContacts.map((contact) => (
        <div
          key={contact._id}
          className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 group relative ${
            selectedUser?._id === contact._id 
              ? "bg-[var(--accent-color)]/10 shadow-lg shadow-[var(--accent-color)]/5 ring-1 ring-[var(--accent-color)]/20" 
              : "hover:bg-[var(--bg-elevated)]"
          }`}
          onClick={() => setSelectedUser(contact)}
        >
          {selectedUser?._id === contact._id && (
            <div className="absolute left-0 w-1 h-8 bg-[var(--accent-color)] rounded-r-full shadow-[0_0_8px_var(--accent-color)]" />
          )}

          <div className="relative">
            <div className="size-13 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-[var(--accent-color)]/50 transition-all duration-300">
              <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} className="size-full object-cover" />
            </div>
            {onlineUsers.includes(contact._id) && (
              <div className="absolute bottom-0 right-0 size-3.5 bg-[var(--accent-color)] border-2 border-[var(--bg-surface)] rounded-full shadow-md" />
            )}
          </div>
          
          <div className="min-w-0">
            <h4 className={`text-[var(--text-main)] font-bold tracking-tight truncate ${selectedUser?._id === contact._id ? "text-[var(--accent-color)]" : ""}`}>
              {contact.fullName}
            </h4>
            <p className="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest mt-0.5">
              Available
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
export default ContactList;
