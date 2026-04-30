import { MessageSquare, Users, User, Settings } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function BottomNavbar() {
  const { activeTab, setActiveTab, selectedUser, setSelectedUser } = useChatStore();

  const tabs = [
    { id: "chats", label: "Chats", icon: MessageSquare },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "settings", label: "Profile", icon: User },
  ];

  if (selectedUser) return null; // Hide navbar when a chat is open on mobile

  return (
    <div className="md:hidden glass-navbar h-16 flex items-center justify-around px-2 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedUser(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${
              isActive ? "text-[#00a884]" : "text-[#8696a0]"
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-300 ${
              isActive ? "bg-[#00a884]/10 shadow-lg shadow-[#00a884]/5 scale-110" : ""
            }`}>
              <Icon className={`size-6 ${isActive ? "fill-[#00a884]/10" : ""}`} />
            </div>
            <span className={`text-[10px] font-semibold tracking-wide uppercase transition-all duration-300 ${
              isActive ? "opacity-100 translate-y-0" : "opacity-60"
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BottomNavbar;
