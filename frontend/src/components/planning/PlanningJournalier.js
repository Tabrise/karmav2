import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';
import { Box, Grid, Typography, IconButton, Paper } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import PlanningJour from './PlanningJour';

const PlanningJournalier = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [praticiens, setPraticiens] = useState([]);
    const [disponibilites, setDisponibilites] = useState({});
    const [rdvs, setRdvs] = useState({});

    // Charger la liste des praticiens
    useEffect(() => {
        const loadPraticiens = async () => {
            try {
                const response = await api.get('/users');
                setPraticiens(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des praticiens:', error);
            }
        };
        loadPraticiens();
    }, []);

    // Charger les disponibilités et rendez-vous pour chaque praticien
    useEffect(() => {
        const loadData = async () => {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            
            try {
                const dispoPromises = praticiens.map(praticien =>
                    api.get(`/disponibilites/user/${praticien.id}`, {
                        params: {
                            startDate: dateStr,
                            endDate: dateStr
                        }
                    })
                );

                const rdvPromises = praticiens.map(praticien =>
                    api.get(`/rdv/praticien/${praticien.id}`, {
                        params: {
                            startDate: dateStr,
                            endDate: dateStr
                        }
                    })
                );

                const dispoResponses = await Promise.all(dispoPromises);
                const rdvResponses = await Promise.all(rdvPromises);

                const newDisponibilites = {};
                const newRdvs = {};

                praticiens.forEach((praticien, index) => {
                    newDisponibilites[praticien.id] = dispoResponses[index].data;
                    newRdvs[praticien.id] = rdvResponses[index].data;
                });

                setDisponibilites(newDisponibilites);
                setRdvs(newRdvs);
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            }
        };

        if (praticiens.length > 0) {
            loadData();
        }
    }, [currentDate, praticiens]);

    // Navigation entre les jours
    const handlePreviousDay = () => setCurrentDate(subDays(currentDate, 1));
    const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

    return (
        <Box sx={{ p: 3 }}>
            {/* En-tête avec navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center', gap: 2 }}>
                <IconButton onClick={handlePreviousDay}>
                    <ChevronLeft />
                </IconButton>
                <Typography variant="h5">
                    {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </Typography>
                <IconButton onClick={handleNextDay}>
                    <ChevronRight />
                </IconButton>
            </Box>

            {/* Grille du planning */}
            <Grid container spacing={2}>
                {praticiens.map((praticien) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={praticien.id}>
                        <PlanningJour
                            date={currentDate}
                            praticien={praticien}
                            rdvs={rdvs[praticien.id] || []}
                            disponibilites={disponibilites[praticien.id] || []}
                            onCreneauClick={(date, heure) => {
                                console.log('Créneau sélectionné:', { date, heure });
                            }}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PlanningJournalier; 