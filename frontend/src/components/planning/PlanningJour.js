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
        const jourSemaine = format(creneau, 'i'); // 1-7, où 1 est lundi
        const dateStr = format(creneau, 'yyyy-MM-dd');
        
        return disponibilites.some(dispo => {
            // Pour les disponibilités spécifiques
            if (dispo.dateSpecifique) {
                try {
                    // S'assurer que la date est valide
                    const dispoDate = new Date(dispo.dateSpecifique);
                    if (isNaN(dispoDate.getTime())) {
                        console.error('Date invalide:', dispo.dateSpecifique);
                        return false;
                    }
                    
                    const formattedDispoDate = format(dispoDate, 'yyyy-MM-dd');
                    
                    console.log('Comparaison dates spécifiques:', {
                        dispoDate: formattedDispoDate,
                        dateStr,
                        match: formattedDispoDate === dateStr
                    });

                    return formattedDispoDate === dateStr &&
                        creneauHeure >= dispo.heureDebut &&
                        creneauHeure < dispo.heureFin;
                } catch (error) {
                    console.error('Erreur lors du traitement de la date:', error);
                    return false;
                }
            }
            
            // Pour les disponibilités récurrentes
            return dispo.recurrent &&
                dispo.jourSemaine === parseInt(jourSemaine) &&
                creneauHeure >= dispo.heureDebut &&
                creneauHeure < dispo.heureFin;
        });
    };

    // Fonction pour vérifier si un créneau est occupé
    const isCreneauOccupe = (creneau) => {
        const creneauHeure = format(creneau, 'HH:mm');
        return rdvs.some(rdv => 
            creneauHeure >= rdv.heureDebut && creneauHeure < rdv.heureFin
        );
    };

    // Fonction pour calculer la position et la hauteur d'un rendez-vous
    const getRdvStyle = (rdv) => {
        const getMinutesSinceStart = (heure) => {
            const [h, m] = heure.split(':').map(Number);
            return (h * 60 + m) - (9 * 60); // 9h00 = début de la journée
        };

        const minutesDebut = getMinutesSinceStart(rdv.heureDebut);
        const minutesFin = getMinutesSinceStart(rdv.heureFin);
        
        const top = (minutesDebut / 30) * 30;
        const height = ((minutesFin - minutesDebut) / 30) * 30;

        return { top, height };
    };

    // Fonction pour gérer le clic sur un créneau libre
    const handleCreneauClick = (heure) => {
        if (!isCreneauOccupe(heure) && isCreneauDisponible(heure) && onCreneauClick) {
            onCreneauClick(date, format(heure, 'HH:mm'));
        }
    };

    const handleRdvClick = (rdv) => {
        setSelectedRdv(rdv);
        setIsDetailsOpen(true);
    };

    const handleRdvUpdate = (updatedRdv) => {
        if (onRdvUpdated) {
            onRdvUpdated(updatedRdv);
        }
    };

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: 0
            }}
        >
            <Typography 
                variant="subtitle1" 
                align="center" 
                sx={{ 
                    py: 1, 
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5'
                }}
            >
                {format(date, 'EEEE', { locale: fr })}
                <br />
                {format(date, 'dd/MM/yyyy')}
            </Typography>
            <Box sx={{ position: 'relative', height: 'calc(100% - 72px)' }}>
                {/* Grille des créneaux horaires */}
                {creneaux.map((creneau, index) => {
                    const creneauHeure = format(creneau, 'HH:mm');
                    const isLunchTime = creneauHeure >= '13:00' && creneauHeure < '14:00';
                    const isOccupe = isCreneauOccupe(creneau);
                    const isDisponible = isCreneauDisponible(creneau);
                    
                    return (
                        <Box
                            key={index}
                            sx={{
                                height: '30px',
                                borderBottom: '1px solid #e0e0e0',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: isDisponible && !isLunchTime && !isOccupe 
                                    ? 'rgba(33, 150, 243, 0.1)' 
                                    : 'transparent',
                                cursor: isDisponible && !isLunchTime && !isOccupe 
                                    ? 'pointer' 
                                    : 'default',
                                '&:hover': isDisponible && !isLunchTime && !isOccupe ? {
                                    backgroundColor: 'rgba(33, 150, 243, 0.2)'
                                } : {},
                                ...(isLunchTime && {
                                    background: 'repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 5px, #ffffff 5px, #ffffff 10px)'
                                })
                            }}
                            onClick={() => {
                                if (isDisponible && !isLunchTime && !isOccupe) {
                                    handleCreneauClick(creneau);
                                }
                            }}
                        />
                    );
                })}

                {/* Rendez-vous */}
                {rdvs.map((rdv, index) => {
                    console.log('Affichage du rendez-vous:', rdv); // Pour le debug
                    const { top, height } = getRdvStyle(rdv);
                    
                    return (
                        <Box
                            key={index}
                            sx={{
                                position: 'absolute',
                                top: `${top}px`,
                                left: 0,
                                right: 0,
                                height: `${height}px`,
                                backgroundColor: '#FFF9C4',
                                border: '1px solid #FFF59D',
                                borderRadius: '4px',
                                padding: '4px',
                                overflow: 'hidden',
                                zIndex: 1,
                                margin: '0 2px',
                                cursor: 'pointer',
                                '&:hover': {
                                    zIndex: 2,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    backgroundColor: '#FFF59D'
                                }
                            }}
                            onClick={() => handleRdvClick(rdv)}
                        >
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    display: 'block',
                                    fontSize: height > 60 ? '0.8rem' : '0.7rem'
                                }}
                            >
                                {rdv.Patient ? `${rdv.Patient.nom} ${rdv.Patient.prenom}` : 'Patient'}
                            </Typography>
                            {height > 45 && (
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        display: 'block', 
                                        color: 'text.secondary',
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {rdv.heureDebut} - {rdv.heureFin}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Dialog de détails du rendez-vous */}
            <RdvDetailsDialog
                open={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedRdv(null);
                }}
                rdv={selectedRdv}
                onRdvUpdated={handleRdvUpdate}
            />
        </Paper>
    );
};

export default PlanningJour; 