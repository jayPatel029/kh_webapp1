const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../databaseConn/database");
const { Ailment } = require("./ailment");
const { Language } = require("./language");

const Question = sequelize.define('questions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    options: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'questions',
    timestamps: false // If you don't want Sequelize to manage createdAt and updatedAt fields
});

const QuestionTranslation = sequelize.define('question_translations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    language_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    options: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'question_translations',
    timestamps: false
}, {
    charset: 'utf8mb4', // Enables support for full Unicode (e.g., multi-language, emojis)
    collate: 'utf8mb4_unicode_ci' // Collation ensures proper sorting for Unicode
});

const QuestionAilments = sequelize.define('question_ailments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ailment_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'question_ailments',
    timestamps: false
});

Question.hasMany(QuestionTranslation, { foreignKey: 'question_id' });
QuestionTranslation.belongsTo(Question, { foreignKey: 'question_id' });

QuestionTranslation.belongsTo(Language, { foreignKey: 'language_id' });
Language.hasMany(QuestionTranslation, { foreignKey: 'language_id' });

Question.hasMany(QuestionAilments, { foreignKey: 'question_id' });
QuestionAilments.belongsTo(Question, { foreignKey: 'question_id' });

QuestionAilments.belongsTo(Ailment, { foreignKey: 'ailment_id' });
Ailment.hasMany(QuestionAilments, { foreignKey: 'ailment_id' });

module.exports = {
    Question,
    QuestionTranslation,
    QuestionAilments
};
