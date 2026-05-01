import { create } from "zustand";
import { axiosInstance, getErrorMessage, getResponseData } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  unreadCounts: {},
  theme: localStorage.getItem("chat-theme") || "dark",

  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      // Clear unread count for the selected user
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [selectedUser._id]: 0 },
      }));
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ allContacts: getResponseData(res) || [] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/partners");
      set({ chats: getResponseData(res) || [] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: getResponseData(res) || [] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, chats } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    
    // Update messages
    set({ messages: [...messages, optimisticMessage] });

    // --- SORTING: Move selected user to top ---
    const otherChats = chats.filter((chat) => chat._id !== selectedUser._id);
    const updatedSelectedUser = { ...selectedUser, lastMessageTime: new Date().toISOString() };
    set({ chats: [updatedSelectedUser, ...otherChats] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const savedMessage = getResponseData(res);
      set({
        messages: get().messages.map((message) => (message._id === tempId ? savedMessage : message)),
      });
    } catch (error) {
      set({ messages: messages });
      toast.error(getErrorMessage(error));
    }
  },

  markMessagesAsSeen: async (partnerId) => {
    try {
      await axiosInstance.put(`/messages/seen/${partnerId}`);
      // Clear unread count in UI
      set((state) => ({
        chats: state.chats.map((chat) => 
          chat._id === partnerId ? { ...chat, unreadCount: 0 } : chat
        ),
      }));
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  },

  typingUsers: {},

  sendTypingStatus: (isTyping, partnerId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !partnerId) return;

    if (isTyping) {
      socket.emit("typing", { to: partnerId });
    } else {
      socket.emit("stop-typing", { to: partnerId });
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messagesSeen");
    socket.off("typing");
    socket.off("stop-typing");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled, chats, markMessagesAsSeen } = get();
      
      const senderId = newMessage.senderId;
      const isFromSelectedUser = selectedUser && senderId === selectedUser._id;

      // --- SORTING & UNREAD COUNT ---
      const existingChat = chats.find((chat) => chat._id === senderId);
      const otherChats = chats.filter((chat) => chat._id !== senderId);

      let updatedChat;
      if (existingChat) {
        updatedChat = { 
          ...existingChat, 
          lastMessage: newMessage.text || "Image", 
          lastMessageTime: newMessage.createdAt,
          unreadCount: isFromSelectedUser ? 0 : (existingChat.unreadCount || 0) + 1
        };
      } else {
        // If it's a brand new chat partner we didn't have in the list yet
        updatedChat = {
          _id: senderId,
          fullName: "New Message", // Will be refreshed on next fetch or handled by fetch logic
          lastMessage: newMessage.text || "Image",
          lastMessageTime: newMessage.createdAt,
          unreadCount: 1
        };
      }

      set({ chats: [updatedChat, ...otherChats] });

      // --- MESSAGE LIST ---
      if (isFromSelectedUser) {
        set({ messages: [...get().messages, newMessage] });
        markMessagesAsSeen(senderId);
      }

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    // Handle messages being seen by the other user
    socket.on("messagesSeen", ({ seenBy }) => {
      const { selectedUser, messages } = get();
      if (selectedUser && seenBy === selectedUser._id) {
        // Update all outgoing messages to seen
        const updatedMessages = messages.map((msg) => 
          msg.receiverId === seenBy ? { ...msg, isSeen: true } : msg
        );
        set({ messages: updatedMessages });
      }
    });

    // --- Typing Indicators ---
    socket.on("typing", ({ from }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [from]: true },
      }));
    });

    socket.on("stop-typing", ({ from }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [from]: false },
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesSeen");
    socket.off("typing");
    socket.off("stop-typing");
  },
}));
