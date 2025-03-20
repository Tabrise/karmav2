const express = require('express');
const router = express.Router();
const disponibiliteController = require('../controllers/disponibiliteController');

// Routes pour les disponibilités
router.get('/user/:userId', disponibiliteController.getDisponibilitesUser);
router.get('/check', disponibiliteController.checkDisponibilite);
router.post('/', disponibiliteController.createDisponibilite);
router.delete('/:id', disponibiliteController.deleteDisponibilite);

module.exports = router; 