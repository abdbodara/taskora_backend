const { Op } = require("sequelize");
const Technician = require("../models/technicianModel");
const bcrypt = require("bcrypt");
const { Task } = require("../models");
const Comment = require("../models/commentModel");

const getTechnicians = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const offset = (page - 1) * limit;

    // Base where clause
    const whereClause = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ],
    };

    // If user is not admin, restrict to their own data
    if (userRole !== "admin") {
      whereClause.userId = userId;
    }

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: Technicians } = await Technician.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      data: Technicians,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get Technicians error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Technicians",
    });
  }
};

const getTechnician = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const technician = await Technician.findOne({
      where: {
        id: req.params.id,
        userId, // Only allow accessing Technician if it belongs to the authenticated user
      },
      // paranoid: false // Include soft-deleted records if needed
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        error: "Technician not found or access denied",
      });
    }

    res.json({
      success: true,
      data: technician,
    });
  } catch (error) {
    console.error("Get Technician error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Technician",
    });
  }
};

const createTechnician = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      status = "active",
    } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Check if Technician with same email exists (if email is provided)
    if (email) {
      const existingTechnician = await Technician.findOne({
        where: {
          email,
          userId, // Also check for the same user's Technicians only
        },
        // paranoid: false // Include soft-deleted records
      });

      if (existingTechnician) {
        return res.status(400).json({
          success: false,
          error: "A Technician with this email already exists in your contacts",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const technician = await Technician.create({
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      password: hashedPassword,
      status,
      userId, // Associate Technician with the authenticated user
    });

    res.status(201).json({
      success: true,
      data: technician,
    });
  } catch (error) {
    console.error("Create Technician error:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        validationErrors: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create Technician",
    });
  }
};

const updateTechnician = async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    const technician = await Technician.findOne({
      where: {
        id: req.params.id,
        userId, // Only allow updating Technician if it belongs to the authenticated user
      },
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        error: "Technician not found or access denied",
      });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== technician.email) {
      const existingTechnician = await Technician.findOne({
        where: { email },
      });

      if (existingTechnician) {
        return res.status(400).json({
          success: false,
          error: "A Technician with this email already exists",
        });
      }
    }

    // Update Technician fields
    await technician.update({
      name: name || technician.name,
      email: email !== undefined ? email || null : technician.email,
      phone: phone !== undefined ? phone || null : technician.phone,
      address: address !== undefined ? address || null : technician.address,
      status: status || technician.status,
    });

    // Fetch the updated Technician
    const updatedTechnician = await Technician.findByPk(technician.id);

    res.json({
      success: true,
      data: updatedTechnician,
    });
  } catch (error) {
    console.error("Update Technician error:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation failed",
        validationErrors: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update Technician",
    });
  }
};

const deleteTechnician = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const technician = await Technician.findOne({
      where: {
        id: req.params.id,
        userId, // Only allow deleting Technician if it belongs to the authenticated user
      },
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        error: "Technician not found or access denied",
      });
    }

    // Soft delete the Technician (paranoid: true in model)
    await technician.destroy();

    res.json({
      success: true,
      message: "Technician deleted successfully",
    });
  } catch (error) {
    console.error("Delete Technician error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete Technician",
    });
  }
};

const changeTechnicianPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long",
      });
    }

    const technician = await Technician.findOne({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        error: "Technician not found or access denied",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

    technician.password = hashedPassword;
    await technician.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update password",
    });
  }
};

const getTechnicianTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      priority,
      dueDateFrom,
      dueDateTo,
    } = req.query;

    const technicianId = req.user.id;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.and]: [
        search
          ? {
              [Op.or]: [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
              ],
            }
          : null,
        status ? { status } : null,
        priority ? { priority } : null,
        dueDateFrom || dueDateTo
          ? {
              dueDate: {
                ...(dueDateFrom && { [Op.gte]: new Date(dueDateFrom) }),
                ...(dueDateTo && { [Op.lte]: new Date(dueDateTo) }),
              },
            }
          : null,
      ].filter(Boolean),
    };

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Technician,
          as: "technicians",
          where: { id: technicianId },
          attributes: [], // Don't include technician data
          through: { attributes: [] },
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "content", "createdAt"],
          include: [
            {
              model: Technician,
              as: "technicians",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      distinct: true,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["dueDate", "ASC NULLS LAST"],
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get technician tasks error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  getTechnicians,
  getTechnician,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  changeTechnicianPassword,
  getTechnicianTasks,
};
