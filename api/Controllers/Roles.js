const {pool} = require('../databaseConn/database.js')
const jwt = require('jsonwebtoken');
const { Role } = require('../Models/roles.js');

const getRoles = async (req, res, next) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json({
            success: true,
            data: roles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getRoleByName = async (req, res, next) => {
    const role_name = req.params.role_name;
    try {
        const role = await Role.findOne({
            where: {
                role_name: role_name
            }
        });
        if (!role) {
            res.status(400).json({
                success: false,
                message: "Role not found"
            });
        } else {
            res.status(200).json({
                success: true,
                data: role
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



const addRole = async (req, res, next) => {
    const { role_name, auth_arr } = req.body;
    try {
        const isRole = await Role.findOne({
            where: {
                role_name: role_name
            }
        });
        if (isRole) {
            res.status(400).json({
                success: false,
                message: "Role already exists"
            });
        } else {
            const newRole = await Role.create({
                role_name: role_name,
                can_vud_mr: auth_arr[0],
                can_vud_am: auth_arr[1],
                can_vud_ca: auth_arr[2],
                can_vud_cd: auth_arr[3],
                can_vud_pq: auth_arr[4],
                can_vud_p: auth_arr[5],
                can_vud_dr: auth_arr[6],
                can_vud_dir: auth_arr[7],
                can_vud_cp: auth_arr[8],
                can_vud_ups: auth_arr[9],
                can_vud_docr: auth_arr[10],
                can_vud_fb : auth_arr[11],
    
            });
            res.status(200).json({
                success: true,
                message: "Role added successfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const updateRole = async (req, res, next) => {
    const { auth_arr } = req.body;
    const role_name = req.params.role_name;
    try {
        const role = await Role.findOne({
            where: {
                role_name: role_name
            }
        });
        if (!role) {
            res.status(400).json({
                success: false,
                message: "Role does not exist"
            });
        } else {
            role.can_vud_mr = auth_arr[0];
            role.can_vud_am = auth_arr[1];
            role.can_vud_ca = auth_arr[2];
            role.can_vud_cd = auth_arr[3];
            role.can_vud_pq = auth_arr[4];
            role.can_vud_p = auth_arr[5];
            role.can_vud_dr = auth_arr[6];
            role.can_vud_dir = auth_arr[7];
            role.can_vud_cp = auth_arr[8];
            role.can_vud_ups = auth_arr[9];
            role.can_vud_docr = auth_arr[10];
            role.can_vud_fb = auth_arr[11];
            await role.save();
            res.status(200).json({
                success: true,
                message: "Role updated successfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const isDoctor = async (req,res,next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const [user] = await pool.execute('SELECT * FROM users WHERE email = ?', [decoded.email]);
    
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            data: user.role === 'Doctor'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

const getUserRole = async (req, res, next) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const [user] = await pool.execute('SELECT * FROM users WHERE email = ?', [decoded.email]);
    
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const roleQuery = `SELECT * FROM roles WHERE role_name = '${user.role}';`;
        const roleResult = await pool.query(roleQuery );
        if (roleResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        const role = roleResult[0];
        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

const deleteRole = async (req, res, next) => {
    const role_name = req.params.role_name;
    try {

        const role = await Role.findOne({
            where: {
                role_name: role_name
            }
        });
        if (!role) {
            res.status(400).json({
                success: false,
                message: "Role does not exist"
            });
        } else {
            await role.destroy();
            res.status(200).json({
                success: true,
                message: "Role deleted successfully"
            });
        }
    } catch (error) {
        console.log("error deleting role", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



module.exports = {
    getRoles,
    addRole,
    getRoleByName,
    updateRole,
    getUserRole,
    deleteRole,
    isDoctor
}