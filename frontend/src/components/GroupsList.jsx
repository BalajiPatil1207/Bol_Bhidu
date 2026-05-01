import { useChatStore } from "../store/useChatStore";

const GroupsList = ({ searchQuery = "" }) => {
  const { groups, selectedGroup, setSelectedGroup, isGroupsLoading } = useChatStore();

  if (isGroupsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="loading loading-spinner loading-md text-primary"></div>
        <p className="text-xs text-[var(--text-muted)]">Loading groups...</p>
      </div>
    );
  }

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (groups.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <p className="text-[var(--text-muted)] text-sm">No groups joined yet.</p>
      </div>
    );
  }

  if (filteredGroups.length === 0) return <div className="p-4 text-center text-sm text-[var(--text-muted)]">No groups match "{searchQuery}"</div>;

  return (
    <div className="space-y-1">
      {filteredGroups.map((group) => (
        <div
          key={group._id}
          className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between group relative ${
            selectedGroup?._id === group._id
              ? "bg-[var(--accent-color)]/10 shadow-lg shadow-[var(--accent-color)]/5 ring-1 ring-[var(--accent-color)]/20"
              : "hover:bg-[var(--bg-elevated)]"
          }`}
          onClick={() => setSelectedGroup(group)}
        >
          {selectedGroup?._id === group._id && (
            <div className="absolute left-0 w-1 h-8 bg-[var(--accent-color)] rounded-r-full shadow-[0_0_8px_var(--accent-color)]" />
          )}

          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-12 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-[var(--accent-color)]/50 transition-all duration-300">
              <img
                src={group.groupAvatar || "/avatar.png"}
                alt={group.name}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h4 className={`text-[var(--text-main)] font-bold tracking-tight truncate ${selectedGroup?._id === group._id ? "text-[var(--accent-color)]" : ""}`}>
                {group.name}
              </h4>
              <p className="text-[var(--text-muted)] text-[11px] font-medium truncate mt-0.5">
                {group.members.length} members
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupsList;
