import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, UserPlus, Image as ImageIcon, Loader2 } from "lucide-react";

const CreateGroupModal = ({ onClose }) => {
  const { allContacts, getAllContacts, createGroup } = useChatStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setGroupAvatar(reader.result);
    };
  };

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedMembers.length === 0) return;

    setIsSubmitting(true);
    await createGroup({
      name,
      description,
      members: selectedMembers,
      groupAvatar,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-base-300">
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Create New Group</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={groupAvatar || "/avatar.png"}
                alt="Group Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                <ImageIcon className="w-4 h-4 text-primary-content" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-base-content/60">Group Profile Picture</p>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Group Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full focus:input-primary"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20 focus:textarea-primary"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Members ({selectedMembers.length})</span>
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-base-300 rounded-lg p-2 bg-base-200/50">
              {allContacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => toggleMember(contact._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMembers.includes(contact._id) ? "bg-primary/20 border border-primary/30" : "hover:bg-base-300"
                  }`}
                >
                  <img
                    src={contact.profilePic || "/avatar.png"}
                    alt={contact.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{contact.fullName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className={`btn btn-primary w-full shadow-lg ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting || !name || selectedMembers.length === 0}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
