const { Technician, Task } = require("../models");
const Comment = require("../models/commentModel");

const addCommentToTask = async (req, res) => {
  try {
    const technicianId = req.user.id; // Assuming technician is authenticated
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Comment content is required" });
    }

    // Check if task is assigned to technician
    const task = await Task.findOne({
      where: { id: taskId },
      include: [
        {
          model: Technician,
          as: "technicians",
          where: { id: technicianId },
          attributes: [],
        },
      ],
    });

    if (!task) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this task or task does not exist",
      });
    }

    const comment = await Comment.create({
      content,
      taskId,
      technicianId,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
 
    // Debug logging for safety
    console.log("taskId param:", taskId);
 
    // Validate presence of taskId
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Missing taskId parameter",
      });
    }
 
    const comments = await Comment.findAll({
      where: { taskId },
      include: [
        {
          model: Technician,
          as: "technicians", // Adjust this if your association alias differs
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
 
    res.json({
      success: true,
      data: comments,
    });
  } catch (err) {
    console.error("Error fetching task comments:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  addCommentToTask,
  getTaskComments
};
