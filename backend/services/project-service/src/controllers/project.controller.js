const Project = require('../models/project.model');
const { logger } = require('../utils/logger');

exports.createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const ownerId = req.user.userId;

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      ownerId,
      status: 'ACTIVE' // Default status
    });

    logger.info(`Project created: ${project.id}`);
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Project creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project'
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const { status } = req.query;
    
    const whereClause = { ownerId };
    if (status) {
      whereClause.status = status;
    }

    const projects = await Project.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    // Return empty array if no projects found
    res.json({
      success: true,
      data: projects || []
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;

    const project = await Project.findOne({
      where: {
        id,
        ownerId
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project'
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;
    const updates = req.body;

    const project = await Project.findOne({
      where: {
        id,
        ownerId
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized'
      });
    }

    await project.update(updates);

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project'
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.userId;

    const project = await Project.findOne({
      where: {
        id,
        ownerId
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized'
      });
    }

    await project.destroy();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project'
    });
  }
};
