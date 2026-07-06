import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.config.js';

const Job = sequelize.define('job', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    technology: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    openings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    experienceRequired: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    internship: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    applicants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'jobs',
    timestamps: true,
});

export default Job;