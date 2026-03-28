exports.requireAuth = (req, res, next) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!(req.user?.isAdmin || req.user?.role === 'admin')) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

exports.requireSelfOrAdmin = (req, res, next) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const paramId = req.params.id;
  if (req.user?.isAdmin || req.user?.role === 'admin' || String(req.user._id) === String(paramId)) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

exports.requireSeller = (req, res, next) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user?.role !== "seller" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// Role-based access: support can view users/orders and some actions; marketing can manage campaigns/promos; admin has full access.
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userRole = req.user?.role || "buyer";
  if (roles.includes(userRole) || req.user?.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

exports.requireAdminOrSupport = (req, res, next) => {
  if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });
  if (req.user?.isAdmin || req.user?.role === "admin" || req.user?.role === "support") return next();
  return res.status(403).json({ message: "Forbidden" });
};

exports.requireAdminOrMarketing = (req, res, next) => {
  if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });
  if (req.user?.isAdmin || req.user?.role === "admin" || req.user?.role === "marketing") return next();
  return res.status(403).json({ message: "Forbidden" });
};

