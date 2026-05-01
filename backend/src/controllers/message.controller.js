import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { handle200, handle201 } from "../helper/successHandler.js";
import { formatMongooseError, handle404, handle400 } from "../helper/errorHandler.js";


export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    return handle200(res, filteredUsers, "Contacts fetched successfully");
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    return formatMongooseError(res, error);
  }
};


export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    return handle200(res, messages, "Messages fetched successfully");
  } catch (error) {
    console.error("Error in getMessagesByUserId:", error);
    return formatMongooseError(res, error);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, file } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !audio && !file) {
      return handle400(res, "Text, image, audio or file is required.");
    }

    if (senderId.equals(receiverId)) {
      return handle400(res, "Cannot send messages to yourself.");
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return handle404(res, "Receiver not found");
    }

    let imageUrl;
    let cloudinaryId;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
      cloudinaryId = uploadResponse.public_id;
    }

    let audioUrl;
    let audioCloudinaryId;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video", // Cloudinary treats audio as video resource type
        folder: "voice_messages"
      });
      audioUrl = uploadResponse.secure_url;
      audioCloudinaryId = uploadResponse.public_id;
    }

    let fileUrl;
    let fileType;
    let fileCloudinaryId;
    if (file) {
        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "raw",
            folder: "documents"
        });
        fileUrl = uploadResponse.secure_url;
        fileCloudinaryId = uploadResponse.public_id;
        // Extract type from base64 if needed, or just let client send it. 
        // For now, assume it's part of messageData from frontend.
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
      file: fileUrl,
      fileType: req.body.fileType,
      cloudinaryId,
      audioCloudinaryId,
      fileCloudinaryId,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return handle201(res, newMessage, "Message sent successfully");
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    return formatMongooseError(res, error);
  }
};


export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const chatPartners = await Message.aggregate([
      // 1. Find all messages related to the logged-in user
      {
        $match: {
          $or: [
            { senderId: loggedInUserId },
            { receiverId: loggedInUserId }
          ]
        }
      },
      // 2. Sort by time to ensure we get the latest
      { $sort: { createdAt: -1 } },
      // 3. Group by the "other" user
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$text" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$receiverId", loggedInUserId] },
                    { $eq: ["$isSeen", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      // 4. Join with User collection to get names/pics
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      // 5. Clean up the output
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1,
          fullName: "$userDetails.fullName",
          profilePic: "$userDetails.profilePic",
          email: "$userDetails.email"
        }
      },
      // 6. Final Sort by latest activity
      { $sort: { lastMessageTime: -1 } }
    ]);

    return handle200(res, chatPartners, "Chat partners fetched successfully");
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    return formatMongooseError(res, error);
  }
};
export const markMessagesAsSeen = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: senderId } = req.params;

    // Update messages where I am the receiver and the specified user is the sender
    await Message.updateMany(
      { senderId: senderId, receiverId: myId, isSeen: false },
      { $set: { isSeen: true } }
    );

    // Notify the sender that their messages have been seen
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: myId });
    }

    return handle200(res, null, "Messages marked as seen");
  } catch (error) {
    console.error("Error in markMessagesAsSeen:", error);
    return formatMongooseError(res, error);
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return handle404(res, "Message not found");

    // Check if user already reacted with THIS emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add reaction (remove any existing reaction from this user first if you want only one reaction per user)
      // For now, let's allow multiple different emojis from same user, or just one? 
      // Let's do one reaction per user for simplicity (like WhatsApp)
      const userPrevReactionIndex = message.reactions.findIndex(
        (r) => r.userId.toString() === userId.toString()
      );
      if (userPrevReactionIndex > -1) {
        message.reactions.splice(userPrevReactionIndex, 1);
      }
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Emit event
    if (message.groupId) {
      io.to(message.groupId.toString()).emit("messageReaction", { messageId, reactions: message.reactions });
    } else {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      const senderSocketId = getReceiverSocketId(message.senderId);
      
      if (receiverSocketId) io.to(receiverSocketId).emit("messageReaction", { messageId, reactions: message.reactions });
      if (senderSocketId) io.to(senderSocketId).emit("messageReaction", { messageId, reactions: message.reactions });
    }

    return handle200(res, message.reactions, "Reaction toggled");
  } catch (error) {
    console.error("Error in toggleReaction:", error);
    return formatMongooseError(res, error);
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return handle404(res, "Message not found");

    if (message.senderId.toString() !== userId.toString()) {
      return handle400(res, "You can only edit your own messages");
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    // Emit event
    const payload = { messageId, text, isEdited: true };
    if (message.groupId) {
      io.to(message.groupId.toString()).emit("updateMessage", payload);
    } else {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      const senderSocketId = getReceiverSocketId(message.senderId);
      if (receiverSocketId) io.to(receiverSocketId).emit("updateMessage", payload);
      if (senderSocketId) io.to(senderSocketId).emit("updateMessage", payload);
    }

    return handle200(res, message, "Message edited");
  } catch (error) {
    console.error("Error in editMessage:", error);
    return formatMongooseError(res, error);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return handle404(res, "Message not found");

    if (message.senderId.toString() !== userId.toString()) {
      return handle400(res, "You can only delete your own messages");
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.image = null;
    message.audio = null;
    await message.save();

    // Emit event
    const payload = { messageId, isDeleted: true };
    if (message.groupId) {
      io.to(message.groupId.toString()).emit("updateMessage", payload);
    } else {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      const senderSocketId = getReceiverSocketId(message.senderId);
      if (receiverSocketId) io.to(receiverSocketId).emit("updateMessage", payload);
      if (senderSocketId) io.to(senderSocketId).emit("updateMessage", payload);
    }

    return handle200(res, message, "Message deleted");
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    return formatMongooseError(res, error);
  }
};
