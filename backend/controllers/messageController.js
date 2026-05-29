import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Admin sees all employees except self
// Employee sees all employees except self
export const getEmployeeList = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("name email role department avatar")
      .sort({ name: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrGetConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
    }).populate("participants", "name email role department avatar");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name email role department avatar"
      );
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "name email role department avatar")
      .sort({ lastMessageAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name email role department avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text?.trim()) {
      return res.status(400).json({ message: "conversationId and text are required" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text: text.trim(),
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name email role department avatar"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
