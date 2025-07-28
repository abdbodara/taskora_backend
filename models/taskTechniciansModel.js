const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const TaskTechnician = sequelize.define(
  "TaskTechnician",
  {
    TaskId: {
      type: DataTypes.INTEGER,
      references: {
        model: "tasks",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      primaryKey: true,
    },
    TechnicianId: {
      type: DataTypes.INTEGER,
      references: {
        model: "technicians",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      primaryKey: true,
    },
  },
  {
    tableName: "task_technicians",
    timestamps: false,
  }
);

module.exports = TaskTechnician;
