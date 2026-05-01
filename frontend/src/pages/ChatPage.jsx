import { useChatStore } from "../store/useChatStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import BottomNavbar from "../components/BottomNavbar";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupsList from "../components/GroupsList";
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";

function ChatPage() {
  const { activeTab, selectedUser, selectedGroup, subscribeToMessages, unsubscribeFromMessages, getMyGroups, groups, chats, contacts } = useChatStore();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    subscribeToMessages();
    getMyGroups();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages, getMyGroups]);

  return (
    <div className="h-[100dvh] md:h-[calc(100vh-4rem)] w-full max-w-6xl mx-auto overflow-hidden overflow-x-hidden bg-[var(--bg-main)] md:rounded-2xl shadow-2xl flex flex-col md:flex-row border border-[var(--border-color)]">
      {/* SIDEBAR / MOBILE LIST */}
      <div className={`flex-1 md:flex-none md:w-[380px] flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)] transition-all duration-300 ${selectedUser || selectedGroup ? "hidden md:flex" : "flex"}`}>
        
        {/* DESKTOP HEADER & TABS */}
        <div className="hidden md:block">
          <ProfileHeader />
          <ActiveTabSwitch />
        </div>

        {/* MOBILE HEADER (Conditional based on tab) */}
        <div className="md:hidden">
          {activeTab !== "settings" && <ProfileHeader />}
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 py-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-color)] transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[var(--accent-color)]/30 focus:border-[var(--accent-color)]/50 outline-none transition-all placeholder:text-[var(--text-muted)]/50"
            />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          {activeTab === "settings" ? (
            <div className="md:hidden h-full">
              <ProfileHeader isFullView />
            </div>
          ) : activeTab === "chats" ? (
            <div className="p-2 md:p-4 space-y-1">
              <ChatsList searchQuery={searchQuery} />
            </div>
          ) : activeTab === "groups" ? (
            <div className="p-2 md:p-4 space-y-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[var(--text-main)] font-bold">Groups ({groups.length})</h3>
                <button 
                    onClick={() => setShowGroupModal(true)}
                    className="btn btn-sm btn-circle btn-primary shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                </button>
              </div>
              <GroupsList searchQuery={searchQuery} />
            </div>
          ) : (
            <div className="p-2 md:p-4 space-y-1">
              <ContactList searchQuery={searchQuery} />
            </div>
          )}
        </div>

        {/* MOBILE NAVIGATION */}
        <BottomNavbar />
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex flex-col bg-[var(--bg-main)] relative min-h-0 ${!selectedUser && !selectedGroup ? "hidden md:flex" : "flex"}`}>
        {selectedUser || selectedGroup ? (
          <ChatContainer />
        ) : (
          <div className="hidden md:flex flex-1 min-h-0">
            <NoConversationPlaceholder />
          </div>
        )}
      </div>

      {showGroupModal && <CreateGroupModal onClose={() => setShowGroupModal(false)} />}
    </div>
  );
}
export default ChatPage;
