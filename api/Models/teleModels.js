const { DataTypes } = require('sequelize');
const { sequelize } = require('../databaseConn/database');

// Services model
const Services = sequelize.define('services', {
    service_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    service_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    tableName: 'services',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
});

// Vitals model
const Vitals = sequelize.define('vitals', {
    vitals_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    blood_pressure: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    heart_rate: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    temperature: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
    },
    weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'vitals',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
});


// Consultations model
const Consultations = sequelize.define('consultations', {
    consultation_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    vitals_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    consultation_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    consultation_time: {
        type: DataTypes.TIME,
        allowNull: false,
    }
}, {
    tableName: 'consultations',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
});

// Bills model
const Bills = sequelize.define('bills', {
    bill_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
    }
}, {
    tableName: 'bills',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
});

//appointments table
const Appointments = sequelize.define('appointments', {
    appointment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    appointment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    appointment_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    bill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    vitals_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    appointment_type: {
        type: DataTypes.ENUM('online', 'inperson'),
        allowNull: false,
        defaultValue: 'inperson' // Default value if not specified
    }
}, {
    tableName: 'appointments',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
});



module.exports = {
    Services,
    Vitals,
    Bills,
    Consultations,
    Appointments,
};
