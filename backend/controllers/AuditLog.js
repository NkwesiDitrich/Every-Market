const AuditLog = require("../models/AuditLog")

exports.getAll = async (req, res) => {
  try {
    const { action, targetType, targetId, user, limit = 100, page = 1 } = req.query
    
    const filter = {}
    if (action) filter.action = action
    if (targetType) filter.targetType = targetType
    if (targetId) filter.targetId = targetId
    if (user) filter.user = user
    
    const skip = (page - 1) * limit
    
    const logs = await AuditLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .exec()
      
    const total = await AuditLog.countDocuments(filter)
    
    res.status(200).json({
      logs,
      total,
      page: Number(page),
      limit: Number(limit)
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching audit logs" })
  }
}
