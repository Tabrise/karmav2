const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'karma_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: console.log,
        logQueryParameters: true,
        timezone: '+01:00', // Fuseau horaire de Paris
        dialectOptions: {
            dateStrings: true,
            typeCast: function (field, next) {
                if (field.type === 'DATETIME' || field.type === 'DATE') {
                    return field.string();
                }
                return next();
            }
        }
    }
);

module.exports = sequelize; 