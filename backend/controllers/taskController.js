import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Title and assigned employee are required",
      });
    }

    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || "medium",
      assignedTo,
      assignedBy: req.user._id,
      status: "todo",
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const existingTask = await Task.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role");

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignedUser =
      existingTask.assignedTo &&
      existingTask.assignedTo._id.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    const oldStatus = existingTask.status;

    if (!isAdmin) {
      const allowedFields = ["status"];
      const incomingKeys = Object.keys(req.body || {});
      const hasInvalidField = incomingKeys.some(
        (key) => !allowedFields.includes(key)
      );

      if (hasInvalidField) {
        return res.status(403).json({
          success: false,
          message: "Users can only update task status",
        });
      }
    }

    existingTask.status = req.body.status ?? existingTask.status;
    existingTask.title = isAdmin ? req.body.title ?? existingTask.title : existingTask.title;
    existingTask.description = isAdmin
      ? req.body.description ?? existingTask.description
      : existingTask.description;
    existingTask.priority = isAdmin
      ? req.body.priority ?? existingTask.priority
      : existingTask.priority;
    existingTask.assignedTo = isAdmin
      ? req.body.assignedTo ?? existingTask.assignedTo
      : existingTask.assignedTo;

    await existingTask.save();

    console.log("Old status:", oldStatus);
    console.log("New status:", existingTask.status);

    if (oldStatus !== "done" && existingTask.status === "done") {
      const adminUsers = await User.find({ role: "admin" }).select("_id name email role");
      console.log("Admins found:", adminUsers);

      if (adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          recipient: admin._id,
          sender: req.user._id,
          type: "task_completed",
          title: "Task Completed",
          message: `${existingTask.assignedTo?.name || "An employee"} completed task "${existingTask.title}"`,
          relatedTask: existingTask._id,
          isRead: false,
        }));

        console.log("Notifications payload:", notifications);

        const inserted = await Notification.insertMany(notifications);
        console.log("Inserted notifications:", inserted);
      } else {
        console.log("No admin users found");
      }
    }

    const updatedTask = await Task.findById(existingTask._id)
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignedUser =
      task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};