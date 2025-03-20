const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rdv = sequelize.define('Rdv', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PatientId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    heureDebut: {
        type: DataTypes.TIME,
        allowNull: false
    },
    heureFin: {
        type: DataTypes.TIME,
        allowNull: false
    }
});

module.exports = Rdv; 