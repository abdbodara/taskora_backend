const { Op } = require("sequelize");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          association: "technicians",
          attributes: ["id", "name", "email", "status"],
          limit: 5, // Limit the number of Technicians to include
        },
        {
          association: "tasks",
          attributes: ["id", "title", "status", "dueDate"],
          limit: 5, // Limit the number of tasks to include
          order: [["dueDate", "ASC"]], // Show upcoming tasks first
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: "Current password is required to set a new password",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: "Current password is incorrect",
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    let errorMessage = "Failed to update profile";
    if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage = "Email already in use";
    } else if (error.name === "SequelizeValidationError") {
      errorMessage = "Validation failed";
    }

    res.status(400).json({
      success: false,
      error: errorMessage,
      ...(error.errors && { validationErrors: error.errors }),
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ],
    };

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "ASC"]],
      include: [
        {
          association: "technicians",
          attributes: ["id", "name", "email", "status"],
        },
        {
          association: "tasks",
          attributes: ["id", "title", "status", "dueDate"],
        },
      ],
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          association: "technicians",
          attributes: ["id", "name", "email", "status"],
        },
        {
          association: "tasks",
          attributes: ["id", "title", "status", "dueDate"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email,  password } = req.body;
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update user data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);

    // Return updated user without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    let errorMessage = "Failed to update user";
    if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage = "Email already in use";
    } else if (error.name === "SequelizeValidationError") {
      errorMessage = "Validation failed";
    }

    res.status(400).json({
      success: false,
      error: errorMessage,
      ...(error.errors && { validationErrors: error.errors }),
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot delete your own account",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
