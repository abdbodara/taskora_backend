const { Op } = require("sequelize");
const Task = require("../models/taskModel");
const Technician = require("../models/technicianModel");
const Comment = require("../models/commentModel");

const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, priority } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
 
    const baseWhere = { userId };
    const searchConditions = [];
 
    if (search) {
      searchConditions.push(
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { "$technicians.name$": { [Op.iLike]: `%${search}%` } },
        { "$technicians.email$": { [Op.iLike]: `%${search}%` } }
      );
    }
 
    const whereCondition = search
      ? { ...baseWhere, [Op.or]: searchConditions }
      : baseWhere;
 
    if (status) whereCondition.status = status;
    if (priority) whereCondition.priority = priority;
 
    // Step 1: Get distinct task IDs with pagination
    const taskIdsResult = await Task.findAll({
      where: whereCondition,
      include: search
        ? [
            {
              model: Technician,
              as: "technicians",
              through: { attributes: [] },
              attributes: [],
              required: false,
            },
          ]
        : [],
      attributes: ["id"],
      order: [
        ["dueDate", "ASC"],
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
      offset: parseInt(offset),
      limit: parseInt(limit),
      subQuery: false,
    });
 
    const taskIds = taskIdsResult.map((task) => task.id);
 
    // Step 2: Get full tasks by those IDs
    const tasks = await Task.findAll({
      where: { id: taskIds },
      include: [
        {
          model: Technician,
          as: "technicians",
          through: { attributes: [] },
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [
        ["dueDate", "ASC"],
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
 
    // Step 3: Get correct count (only distinct tasks)
    const totalCount = await Task.count({ where: whereCondition });
 
    res.json({
      success: true,
      data: tasks,
      pagination: {
        total: totalCount,
        page: +page,
        pages: Math.ceil(totalCount / limit),
        limit: +limit,
        perPage: tasks.length,
      },
    });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};



const getTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId,
      },
      include: [
        {
          model: Technician,
          as: "technicians",
          attributes: ["id", "name", "email"],
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
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found or access denied",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task",
    });
  }
};

const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      technicianIds = [],
    } = req.body;

    // Optional: Validate each technicianId belongs to user
    const validTechnicians = await Technician.findAll({
      where: {
        id: technicianIds,
        userId,
      },
    });

    if (validTechnicians.length !== technicianIds.length) {
      return res.status(400).json({
        success: false,
        error: "Some technician IDs are invalid or do not belong to the user",
      });
    }

    const task = await Task.create({
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      dueDate: dueDate || null,
      userId,
    });

    await task.setTechnicians(validTechnicians); // Sequelize magic

    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Technician,
          as: "technicians",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: createdTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create task",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, status, priority, dueDate, technicianIds } =
      req.body;

    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found or access denied",
      });
    }

    // Optional validation of technicianIds
    if (technicianIds !== undefined) {
      const validTechnicians = await Technician.findAll({
        where: {
          id: technicianIds,
          userId,
        },
      });

      if (validTechnicians.length !== technicianIds.length) {
        return res.status(400).json({
          success: false,
          error: "Some technician IDs are invalid or do not belong to the user",
        });
      }

      await task.setTechnicians(validTechnicians); // Update many-to-many relation
    }

    // Prepare update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;

    // Update fields if provided
    if (Object.keys(updateData).length > 0) {
      await task.update(updateData);
    }

    // Fetch updated task with technicians
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Technician,
          as: "technicians",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update task",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found or access denied",
      });
    }

    // Soft delete the task (paranoid: true in model)
    await task.destroy();

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
    });
  }
};

const technicianUpdateTaskStatus = async (req, res) => {
  try {
    const technicianId = req.user.id; // assuming technician is authenticated
    const { status } = req.body;
    const taskId = req.params.id;

    // Validate status
    const allowedStatuses = ["pending", "in_progress", "completed"]; // adjust based on your app
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    // Check if this technician is assigned to the task
    const task = await Task.findOne({
      where: { id: taskId },
      include: {
        model: Technician,
        as: "technicians",
        where: { id: technicianId },
      },
    });

    if (!task) {
      return res.status(403).json({
        success: false,
        error: "You are not assigned to this task",
      });
    }

    // Update only the status
    await task.update({ status });

    res.json({
      success: true,
      message: "Task status updated",
      data: { id: task.id, status },
    });
  } catch (error) {
    console.error("Technician status update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update task status",
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  technicianUpdateTaskStatus,
};
