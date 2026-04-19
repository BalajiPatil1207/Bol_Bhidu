import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all ${
          activeTab === "chats" ? "bg-[#00a884]/20 text-[#00a884]" : "text-[#8696a0]"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all ${
          activeTab === "contacts" ? "bg-[#00a884]/20 text-[#00a884]" : "text-[#8696a0]"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
