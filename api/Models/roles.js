const { DataTypes } = require('sequelize');
const { sequelize } = require('../databaseConn/database');

const Role = sequelize.define('role', {
    role_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
        collate: 'utf8mb4_general_ci'
    },
    can_vud_mr: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_am: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_ca: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_cd: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_pq: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_p: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_dr: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_dir: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_cp: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_ups: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_docr: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    },
    can_vud_fb: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'roles',
    timestamps: false,
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB'
});

async function createAndAddRoles() {
    const rolesData = [
        {
            role_name: "Admin",
            can_vud_mr: 7,
            can_vud_am: 7,
            can_vud_ca: 7,
            can_vud_cd: 7,
            can_vud_pq: 7,
            can_vud_p: 7,
            can_vud_dr: 7,
            can_vud_dir: 7,
            can_vud_cp: 7,
            can_vud_ups: 7,
            can_vud_docr: 7,
            can_vud_fb: 7,
        },
        {
            role_name: "Doctor",
            can_vud_mr: 0,
            can_vud_am: 0,
            can_vud_ca: 0,
            can_vud_cd: 0,
            can_vud_pq: 0,
            can_vud_p: 7,
            can_vud_dr: 0,
            can_vud_dir: 0,
            can_vud_cp: 0,
            can_vud_ups: 0,
            can_vud_docr: 0,
            can_vud_fb: 0,
        },
        {
            role_name: "Medical Staff",
            can_vud_mr: 0,
            can_vud_am: 0,
            can_vud_ca: 0,
            can_vud_cd: 0,
            can_vud_pq: 0,
            can_vud_p: 3,
            can_vud_dr: 0,
            can_vud_dir: 0,
            can_vud_cp: 0,
            can_vud_ups: 0,       
            can_vud_docr: 0,       
            can_vud_fb: 0,       
        },

        {
            role_name: "Dialysis Technician",
            can_vud_mr: 0,
            can_vud_am: 0,
            can_vud_ca: 0,
            can_vud_cd: 0,
            can_vud_pq: 0,
            can_vud_p: 3,
            can_vud_dr: 0,
            can_vud_dir: 0,
            can_vud_cp: 0,
            can_vud_ups: 0,
            can_vud_docr: 0,
            can_vud_fb: 0,
        },
    ];

    await Role.sync({ force: false });
    await Role.bulkCreate(rolesData, { ignoreDuplicates: true });
}

module.exports = {Role, createAndAddRoles};