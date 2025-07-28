const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title is required",
        },
        len: {
          args: [3, 200],
          msg: "Title must be between 3 and 200 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed", "on_hold"),
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "in_progress", "completed", "on_hold"]],
          msg: "Invalid status",
        },
      },
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
      validate: {
        isIn: {
          args: [["low", "medium", "high", "urgent"]],
          msg: "Invalid priority",
        },
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          msg: "Please provide a valid due date",
        },
        isAfter: {
          args: new Date().toISOString(),
          msg: "Due date must be in the future",
        },
      },
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
    // paranoid: true, // Enable soft deletes
    hooks: {
      beforeUpdate: async (task) => {
        // Automatically set completedAt when status changes to 'completed'
        if (
          task.changed("status") &&
          task.status === "completed" &&
          !task.completedAt
        ) {
          task.completedAt = new Date();
        } else if (
          task.changed("status") &&
          task.status !== "completed" &&
          task.completedAt
        ) {
          task.completedAt = null;
        }
      },
    },
  }
);

module.exports = Task;
