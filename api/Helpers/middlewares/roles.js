const jwt = require('jsonwebtoken');
const { pool } = require('../../databaseConn/database');


const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is not provided',
      });
    }
    const authToken = token.split(' ')[1]; 
    jwt.verify(authToken, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Failed to authenticate token',
        });
      }
      req.user = decoded;
      const user_role_query = `SELECT * FROM users WHERE email = '${req.user.email}'`
      let user = await pool.execute(user_role_query)
      req.user = user[0];
      next();
    });
};




module.exports={
    verifyToken
}