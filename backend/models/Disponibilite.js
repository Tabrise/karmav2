const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disponibilite = sequelize.define('Disponibilite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    heureDebut: {
        type: DataTypes.TIME,
        allowNull: false
    },
    heureFin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    dateSpecifique: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
});

module.exports = Disponibilite; 