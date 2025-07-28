module.exports = (requiredRole) => {
  return (req, res, next) => {
    const role = req.user?.role || req.technician?.role;

    if (role !== requiredRole) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You don't have permission to perform this action",
        });
    }

    next(); 
  };
};
