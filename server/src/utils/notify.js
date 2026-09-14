const { Notification, User } = require("../models");

async function notifyUser(userId, type, message, link) {
  await Notification.create({ userId, type, message, link });
}

async function notifyAdmins(type, message, link) {
  const admins = await User.findAll({ where: { role: "admin" }, attributes: ["id"] });
  await Notification.bulkCreate(
    admins.map((a) => ({ userId: a.id, type, message, link }))
  );
}

module.exports = { notifyUser, notifyAdmins };
