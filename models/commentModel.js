const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Comment content cannot be empty",
        },
      },
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
    },
    technicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "technicians",
        key: "id",
      },
    },
  },
  {
    tableName: "comments",
    timestamps: true,
  }
);

module.exports = Comment;
