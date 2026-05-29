import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getEmployeeSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("settings name email")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      settings: user.settings || {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to load settings",
    });
  }
};

export const updateEmployeeSettings = async (req, res) => {
  try {
    const {
      themeMode,
      emailNotif,
      pushNotif,
      weeklySummary,
      salaryAlert,
      leaveApprovalAlert,
      twoFA,
      showEmail,
      showPhone,
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "settings.themeMode": themeMode === "light" ? "light" : "dark",
          "settings.emailNotif": Boolean(emailNotif),
          "settings.pushNotif": Boolean(pushNotif),
          "settings.weeklySummary": Boolean(weeklySummary),
          "settings.salaryAlert": Boolean(salaryAlert),
          "settings.leaveApprovalAlert": Boolean(leaveApprovalAlert),
          "settings.twoFA": Boolean(twoFA),
          "settings.showEmail": Boolean(showEmail),
          "settings.showPhone": Boolean(showPhone),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("settings");

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Settings updated successfully",
      settings: updated.settings,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to update settings",
    });
  }
};

export const changeEmployeePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All password fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "New password and confirm password do not match",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to update password",
    });
  }
};