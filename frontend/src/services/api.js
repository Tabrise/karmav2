import React, { useState } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { format, isWithinInterval, addMinutes, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import RdvDetailsDialog from '../RdvDetailsDialog';

const PlanningJour = ({ date, rdvs, disponibilites, onCreneauClick, onRdvUpdated }) => {
    const [selectedRdv, setSelectedRdv] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Générer les créneaux horaires de 9h à 18h30
    const creneaux = [];
    const debut = setMinutes(setHours(date, 9), 0);
    const fin = setMinutes(setHours(date, 18), 30);
    
    let currentTime = debut;
    while (currentTime <= fin) {
        creneaux.push(currentTime);
        currentTime = addMinutes(currentTime, 30);
    }

    // Fonction pour vérifier si un créneau est dans une plage de disponibilité
    const isCreneauDisponible = (creneau) => {
        const creneauHeure = format(creneau, 'HH:mm');
        const dateStr = format(creneau, 'yyyy-MM-dd');
        
        console.log('Vérification disponibilité pour:', {
            dateStr,
            creneauHeure,
            disponibilites: disponibilites
        });

        return disponibilites.some(dispo => {
            try {
                const dispoDate = format(new Date(dispo.dateSpecifique), 'yyyy-MM-dd');
                console.log('Comparaison avec disponibilité:', {
                    dispoDate,
                    dateStr,
                    heureDebut: dispo.heureDebut,
                    heureFin: dispo.heureFin,
                    creneauHeure
                });

                const isDisponible = dispoDate === dateStr &&
                    creneauHeure >= dispo.heureDebut &&
                    creneauHeure < dispo.heureFin;

                console.log('Résultat:', isDisponible);
                return isDisponible;
            } catch (error) {
                console.error('Erreur lors du traitement de la disponibilité:', error);
                return false;
            }
        });
    };

    // ... rest of the code ...