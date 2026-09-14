const { AdminLog } = require("../models");

async function logAdminAction({ adminUserId, action, targetType, targetId, details }) {
  await AdminLog.create({
    adminUserId,
    action,
    targetType,
    targetId: String(targetId),
    details: details ? JSON.stringify(details) : null,
  });
}

module.exports = { logAdminAction };
