import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import Group from "../models/Group.js";
import Message from "../models/Message.js";
import { handle200, handle201 } from "../helper/successHandler.js";
import { formatMongooseError, handle400, handle404, handle403 } from "../helper/errorHandler.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members, groupAvatar } = req.body;
    const admin = req.user._id;

    if (!name || !members || members.length === 0) {
      return handle400(res, "Group name and at least one member are required.");
    }

    // Ensure admin is also in members
    const groupMembers = [...new Set([...members, admin.toString()])];

    let avatarUrl = "";
    let cloudinaryId = "";
    if (groupAvatar) {
      const uploadResponse = await cloudinary.uploader.upload(groupAvatar);
      avatarUrl = uploadResponse.secure_url;
      cloudinaryId = uploadResponse.public_id;
    }

    const newGroup = new Group({
      name,
      description,
      admin,
      members: groupMembers,
      groupAvatar: avatarUrl,
      cloudinaryId,
    });

    await newGroup.save();

    // Populate members for the response
    await newGroup.populate("members", "fullName profilePic email");

    // Notify all members via socket if they are online
    // This part will be refined when we update socket.js to join group rooms
    groupMembers.forEach(memberId => {
        // We will emit "newGroup" to each member's private socket room
        // so they see the new group in their sidebar
    });

    return handle201(res, newGroup, "Group created successfully");
  } catch (error) {
    console.error("Error in createGroup:", error);
    return formatMongooseError(res, error);
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("members", "fullName profilePic email")
      .sort({ updatedAt: -1 });

    return handle200(res, groups, "Groups fetched successfully");
  } catch (error) {
    console.error("Error in getMyGroups:", error);
    return formatMongooseError(res, error);
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return handle404(res, "Group not found");
    }

    if (!group.members.includes(userId)) {
      return handle403(res, "You are not a member of this group");
    }

    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    return handle200(res, messages, "Group messages fetched successfully");
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    return formatMongooseError(res, error);
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, audio, file } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return handle404(res, "Group not found");
    }

    if (!group.members.includes(senderId)) {
      return handle403(res, "You are not a member of this group");
    }

    if (!text && !image && !audio && !file) {
      return handle400(res, "Text, image, audio or file is required.");
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
        resource_type: "video",
        folder: "group_voice_messages"
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
            folder: "group_documents"
        });
        fileUrl = uploadResponse.secure_url;
        fileCloudinaryId = uploadResponse.public_id;
    }

    const newMessage = new Message({
      senderId,
      groupId,
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
    
    const populatedMessage = await newMessage.populate("senderId", "fullName profilePic");

    // Emit to group room
    io.to(groupId).emit("newGroupMessage", populatedMessage);

    return handle201(res, populatedMessage, "Message sent to group");
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    return formatMongooseError(res, error);
  }
};
