import { useChatStore } from "../store/useChatStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import BottomNavbar from "../components/BottomNavbar";

import { useEffect } from "react";

function ChatPage() {
  const { activeTab, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-[calc(100vh-2rem)] w-full max-w-6xl mx-auto overflow-hidden bg-[#0b141a] md:rounded-2xl shadow-2xl flex flex-col md:flex-row border border-white/5">
      {/* SIDEBAR / MOBILE LIST */}
      <div className={`flex-1 md:flex-none md:w-[380px] flex-col border-r border-white/5 bg-[#111b21] transition-all duration-300 ${selectedUser ? "hidden md:flex" : "flex"}`}>
        
        {/* DESKTOP HEADER & TABS */}
        <div className="hidden md:block">
          <ProfileHeader />
          <ActiveTabSwitch />
        </div>

        {/* MOBILE HEADER (Conditional based on tab) */}
        <div className="md:hidden">
          {activeTab !== "settings" && <ProfileHeader />}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === "settings" ? (
            <div className="md:hidden h-full">
              <ProfileHeader isFullView />
            </div>
          ) : activeTab === "chats" ? (
            <div className="p-2 md:p-4 space-y-1">
              <ChatsList />
            </div>
          ) : (
            <div className="p-2 md:p-4 space-y-1">
              <ContactList />
            </div>
          )}
        </div>

        {/* MOBILE NAVIGATION */}
        <BottomNavbar />
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex flex-col bg-[#0b141a] relative ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {selectedUser ? (
          <ChatContainer />
        ) : (
          <div className="hidden md:flex flex-1">
            <NoConversationPlaceholder />
          </div>
        )}
      </div>
    </div>
  );
}
export default ChatPage;
