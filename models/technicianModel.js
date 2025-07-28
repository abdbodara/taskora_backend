const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcrypt");

const Technician = sequelize.define(
  "Technician",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Technician name is required",
        },
        len: {
          args: [2, 100],
          msg: "Name must be between 2 and 100 characters",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Please provide a valid email address",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9+\-\s()]*$/,
          msg: "Please provide a valid phone number",
        },
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      validate: {
        isIn: {
          args: [["active", "inactive"]],
          msg: "Status must be either active or inactive",
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "technician",
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
    tableName: "technicians",
    timestamps: true,
    // paranoid: true, // Enables soft deletes
    indexes: [
      {
        unique: true,
        fields: ["email"],
        where: {
          email: { [sequelize.Sequelize.Op.ne]: null },
        },
      },
      {
        fields: ["status"],
      },
    ],
  }
);

// Add any model associations here if needed
// Example:
// Technician.associate = (models) => {
//   Technician.hasMany(models.Order, { foreignKey: 'TechnicianId' });
// };

Technician.prototype.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = Technician;
