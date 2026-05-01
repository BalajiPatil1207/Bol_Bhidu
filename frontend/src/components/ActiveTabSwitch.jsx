import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="flex bg-[var(--bg-elevated)] p-1.5 m-3 rounded-xl gap-2 shadow-inner">
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${
          activeTab === "chats" ? "bg-[var(--accent-color)] text-white shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${
          activeTab === "contacts" ? "bg-[var(--accent-color)] text-white shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
        }`}
      >
        Contacts
      </button>

      <button
        onClick={() => setActiveTab("groups")}
        className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${
          activeTab === "groups" ? "bg-[var(--accent-color)] text-white shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
        }`}
      >
        Groups
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
