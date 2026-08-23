import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.config.js';

const Candidate = sequelize.define('candidate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    messageId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    technology: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    experience: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    intership: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    type: {
        type: DataTypes.ENUM('fresher', 'experienced', 'intern', 'trainie', 'junior'),
        allowNull: false,
        defaultValue: 'fresher'
    },
    aiReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    matchedJob: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    appliedJob: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    appliedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    isEmailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'candidates',
    timestamps: true,
});

export default Candidate;