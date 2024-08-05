const { DataTypes } = require('sequelize');
const { sequelize } = require('../databaseConn/database');

const Language = sequelize.define('language', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    language_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    language_json: {
        type: DataTypes.STRING,
        allowNull: true
    },
    language_audio: {
        type: DataTypes.STRING,
        allowNull: true
    }
});


const addLanguages = async () => {
    try {
        await Language.findOrCreate({
            where: { language_name: 'English' },
            defaults: { language_name: 'English' }
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = { Language, addLanguages };
