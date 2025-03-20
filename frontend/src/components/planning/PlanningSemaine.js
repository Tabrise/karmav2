import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Autocomplete, 
    TextField,
    CircularProgress,
    Typography,
    IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { startOfWeek, addDays, format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import PlanningJour from './PlanningJour';
import NewRdvDialog from '../NewRdvDialog';
import api from '../../config/api';

const PlanningSemaine = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [rdvs, setRdvs] = useState([]);
    const [disponibilites, setDisponibilites] = useState([]);
    const [isNewRdvDialogOpen, setIsNewRdvDialogOpen] = useState(false);
    const [selectedCreneau, setSelectedCreneau] = useState(null);
    const [praticiens, setPraticiens] = useState([]);
    const [selectedPraticien, setSelectedPraticien] = useState(null);

    // Charger la liste des praticiens
    const loadPraticiens = async () => {
        try {
            const response = await api.get('/users');
            setPraticiens(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des praticiens:', error);
        }
    };

    // Charger les rendez-vous de la semaine
    const loadRdvs = async () => {
        if (!selectedPraticien) return;
        try {
            const startDate = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const endDate = format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');
            const response = await api.get(`/rdvs/semaine/${startDate}/${endDate}/${selectedPraticien.id}`);
            console.log('Rendez-vous chargés:', response.data); // Pour le debug
            setRdvs(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des rendez-vous:', error);
        }
    };

    // Charger les disponibilités du praticien
    const loadDisponibilites = async () => {
        if (!selectedPraticien) return;
        try {
            const response = await api.get(`/disponibilites/user/${selectedPraticien.id}`);
            setDisponibilites(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Erreur lors du chargement des disponibilités:', error);
        }
    };

    useEffect(() => {
        loadPraticiens();
    }, []);

    useEffect(() => {
        if (selectedPraticien) {
            loadRdvs();
            loadDisponibilites();
        }
    }, [currentWeek, selectedPraticien]);

    const handlePreviousWeek = () => {
        setCurrentWeek(subWeeks(currentWeek, 1));
    };

    const handleNextWeek = () => {
        setCurrentWeek(addWeeks(currentWeek, 1));
    };

    const handleCreneauClick = (date, heure) => {
        // Utiliser format pour s'assurer que la date est au bon format
        const dateStr = format(date, 'yyyy-MM-dd');
        console.log('Date sélectionnée:', dateStr); // Debug
        setSelectedCreneau({
            date: dateStr,
            heure: heure
        });
        setIsNewRdvDialogOpen(true);
    };

    const handleRdvCreated = () => {
        loadRdvs();
        setIsNewRdvDialogOpen(false);
        setSelectedCreneau(null);
    };

    const handleRdvUpdated = () => {
        loadRdvs();
    };

    // Générer les jours de la semaine (seulement jours ouvrés)
    const joursSemaine = [];
    const debutSemaine = startOfWeek(currentWeek, { weekStartsOn: 1 });
    for (let i = 0; i < 5; i++) {
        joursSemaine.push(addDays(debutSemaine, i));
    }

    // Générer les créneaux horaires
    const generateCreneaux = () => {
        const creneaux = [];
        let heure = 9;
        let minutes = 0;
        
        while (heure < 19 || (heure === 18 && minutes === 30)) {
            creneaux.push(format(new Date().setHours(heure, minutes), 'HH:mm'));
            minutes += 30;
            if (minutes === 60) {
                minutes = 0;
                heure += 1;
            }
        }
        return creneaux;
    };

    const creneaux = generateCreneaux();

    return (
        <Box sx={{ p: 3 }}>
            {/* Sélecteur de praticien */}
            <Autocomplete
                options={praticiens}
                getOptionLabel={(praticien) => `${praticien.nom} ${praticien.prenom}`}
                value={selectedPraticien}
                onChange={(event, newValue) => setSelectedPraticien(newValue)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Sélectionner un praticien"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 3 }}
                    />
                )}
            />

            {selectedPraticien && (
                <>
                    {/* En-tête avec navigation */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={handlePreviousWeek}>
                            <ChevronLeft />
                        </IconButton>
                        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
                            Semaine du {format(debutSemaine, 'dd MMMM yyyy', { locale: fr })}
                        </Typography>
                        <IconButton onClick={handleNextWeek}>
                            <ChevronRight />
                        </IconButton>
                    </Box>

                    {/* Container pour le planning avec les heures */}
                    <Box sx={{ display: 'flex', maxWidth: '100%', overflowX: 'auto' }}>
                        {/* Colonne des heures */}
                        <Box sx={{ 
                            width: '60px', 
                            flexShrink: 0,
                            borderRight: '1px solid #e0e0e0',
                            backgroundColor: '#f5f5f5'
                        }}>
                            {/* Espace pour aligner avec l'en-tête des jours */}
                            <Box sx={{ 
                                height: '72px', 
                                borderBottom: '1px solid #e0e0e0',
                                backgroundColor: '#f5f5f5'
                            }} />
                            {/* Les heures */}
                            {creneaux.map((heure, index) => (
                                <Box
                                    key={heure}
                                    sx={{
                                        height: '30px',
                                        borderBottom: '1px solid #e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {heure}
                                </Box>
                            ))}
                        </Box>

                        {/* Grille des jours */}
                        <Grid container spacing={0} sx={{ flexGrow: 1 }}>
                            {joursSemaine.map((jour, index) => (
                                <Grid item xs key={index} sx={{ minWidth: 200 }}>
                                    <PlanningJour
                                        date={jour}
                                        rdvs={rdvs.filter(rdv => format(new Date(rdv.date), 'yyyy-MM-dd') === format(jour, 'yyyy-MM-dd'))}
                                        disponibilites={disponibilites}
                                        onCreneauClick={handleCreneauClick}
                                        onRdvUpdated={handleRdvUpdated}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Dialog de création de rendez-vous */}
                    <NewRdvDialog
                        open={isNewRdvDialogOpen}
                        onClose={() => {
                            setIsNewRdvDialogOpen(false);
                            setSelectedCreneau(null);
                        }}
                        initialData={selectedCreneau ? {
                            date: selectedCreneau.date,
                            heureDebut: selectedCreneau.heure,
                            praticienId: selectedPraticien.id
                        } : null}
                        onRdvAdded={handleRdvCreated}
                    />
                </>
            )}
        </Box>
    );
};

export default PlanningSemaine; 