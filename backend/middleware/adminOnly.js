// middleware/adminOnly.js
export const adminOnly = (req, res, next) => {
  try {
    // protect middleware must set req.user
    if (!req.user) return res.status(401).json({ success: false, error: "Not authorized" });

    // allow admin + hr if you want HR to manage leave too
    const allowed = ["admin", "hr"];
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Admin/HR access only" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};
