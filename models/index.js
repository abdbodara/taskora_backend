const { sequelize } = require("../config/db");
const User = require("./userModel");
const Technician = require("./technicianModel");
const Task = require("./taskModel");
const Comment = require("./commentModel.js");

// Define model relationships
User.hasMany(Technician, {
  foreignKey: "userId",
  as: "technicians",
});

Technician.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Task, {
  foreignKey: "userId",
  as: "tasks",
});

Task.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Task.belongsToMany(Technician, {
  through: "TaskTechnician",
  as: "technicians",
  foreignKey: "TaskId",
  otherKey: "TechnicianId",
});

Technician.belongsToMany(Task, {
  through: "TaskTechnician",
  as: "tasks",
  foreignKey: "TechnicianId",
  otherKey: "TaskId",
});

Task.hasMany(Comment, { foreignKey: "taskId", as: "comments" });

Comment.belongsTo(Task, { foreignKey: "taskId", as: "task" });

Technician.hasMany(Comment, { foreignKey: "technicianId", as: "comments" });
Comment.belongsTo(Technician, {
  foreignKey: "technicianId",
  as: "technicians",
});

// Test the database connection and sync models
const initializeDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Drop existing tables and create new ones (only for development)
    // Be careful with this in production!
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("Database tables created");
    } else {
      // In production, use alter: true with caution
      await sequelize.sync({ alter: false });
      console.log("Database synchronized");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Technician,
  Task,
  Comment,
  initializeDatabase,
};
