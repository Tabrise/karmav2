const Patient = require('./Patient');
const User = require('./User');
const Service = require('./Service');
const Rdv = require('./Rdv');
const Disponibilite = require('./Disponibilite');

// Relations Patient - Service
Patient.belongsTo(Service);
Service.hasMany(Patient);

// Relations Rdv
Rdv.belongsTo(Patient, {
    foreignKey: 'PatientId'
});
Rdv.belongsTo(User, {
    foreignKey: 'UserId'
});

Patient.hasMany(Rdv, {
    foreignKey: 'PatientId'
});
User.hasMany(Rdv, {
    foreignKey: 'UserId'
});

// Relations Disponibilite
Disponibilite.belongsTo(User, {
    foreignKey: 'UserId'
});
User.hasMany(Disponibilite, {
    foreignKey: 'UserId'
});

module.exports = {
    Patient,
    User,
    Service,
    Disponibilite,
    Rdv
}; 