const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE'),
    defaultValue: 'TODO',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    defaultValue: 'MEDIUM',
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assigneeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Task;
