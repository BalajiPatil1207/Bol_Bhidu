import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader({ isFullView = false }) {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  if (isFullView) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass-header px-4 py-8 flex flex-col items-center gap-6">
          <div className="relative group">
            <div className={`size-32 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-2xl relative`}>
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-full object-cover"
              />
              <div 
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <p className="text-white text-sm font-semibold">Change Photo</p>
              </div>
            </div>
            {/* ONLINE INDICATOR */}
            <div className="absolute bottom-2 right-2 size-6 bg-[#00a884] border-4 border-[#111b21] rounded-full shadow-lg" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">{authUser.fullName}</h2>
            <p className="text-emerald-500 text-sm font-medium mt-1">Available</p>
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        </div>

        <div className="flex-1 p-6 space-y-4">
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-300">
              {isSoundEnabled ? <Volume2Icon className="size-5" /> : <VolumeOffIcon className="size-5" />}
              <span className="font-medium">Message Sounds</span>
            </div>
            <button 
              onClick={() => {
                mouseClickSound.currentTime = 0;
                mouseClickSound.play().catch(() => {});
                toggleSound();
              }}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isSoundEnabled ? "bg-emerald-500" : "bg-slate-700"}`}
            >
              <div className={`absolute top-1 size-4 bg-white rounded-full transition-all duration-300 ${isSoundEnabled ? "left-7" : "left-1"}`} />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3 text-slate-300 cursor-pointer hover:bg-white/10 transition-colors">
            <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <User className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Full Name</p>
              <p className="text-sm opacity-60">{authUser.fullName}</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full mt-auto glass-card border-red-500/20 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-400 font-bold hover:bg-red-500/10 transition-colors"
          >
            <LogOutIcon className="size-5" />
            Logout Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-white/5 bg-[#111b21] glass-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full overflow-hidden border-2 border-white/5 relative">
            <img
              src={selectedImg || authUser.profilePic || "/avatar.png"}
              alt="User"
              className="size-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-slate-100 font-bold text-sm max-w-[140px] truncate tracking-tight">
              {authUser.fullName}
            </h3>
            <p className="text-[#00a884] text-[10px] font-bold uppercase tracking-widest">Online</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            onClick={logout}
            title="Logout"
          >
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
