import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import NewPatientDialog from './NewPatientDialog';
import NewRdvDialog from './NewRdvDialog';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#00BCD4',
    zIndex: theme.zIndex.drawer + 1,
}));

const StyledToolbar = styled(Toolbar)({
    display: 'flex',
    justifyContent: 'space-between',
});

const ActionButton = styled(Button)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    marginRight: theme.spacing(1),
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
}));

const TopBar = () => {
    const { user, logout } = useAuth();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
    const [isNewRdvDialogOpen, setIsNewRdvDialogOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleNewPatient = () => {
        setIsNewPatientDialogOpen(true);
    };

    const handlePatientAdded = (newPatient) => {
        // Vous pouvez ajouter ici une notification ou une mise à jour de l'interface
        console.log('Nouveau patient ajouté:', newPatient);
    };

    const handleNewRdv = () => {
        setIsNewRdvDialogOpen(true);
    };

    const handleRdvAdded = (newRdv) => {
        console.log('Nouveau rendez-vous ajouté:', newRdv);
    };

    return (
        <>
            <StyledAppBar position="fixed">
                <StyledToolbar>
                    <Box display="flex" alignItems="center">
                        <Typography variant="h6" sx={{ mr: 4 }}>
                            Contact
                        </Typography>
                        <ActionButton 
                            startIcon={<AddIcon />}
                            onClick={handleNewRdv}
                        >
                            Nouveau RDV
                        </ActionButton>
                        <ActionButton 
                            startIcon={<PersonAddIcon />}
                            onClick={handleNewPatient}
                        >
                            Nouveau patient
                        </ActionButton>
                        <ActionButton startIcon={<SearchIcon />}>
                            
                        </ActionButton>
                    </Box>

                    <Box display="flex" alignItems="center">
                        <Typography sx={{ mr: 3 }}>
                            {formatDate(currentDateTime)} {formatTime(currentDateTime)}
                        </Typography>
                        <Typography sx={{ mr: 2 }}>
                            {user?.nom || 'Max YO'}
                        </Typography>
                        <Button 
                            color="inherit" 
                            onClick={logout}
                            startIcon={<LogoutIcon />}
                        />
                    </Box>
                </StyledToolbar>
            </StyledAppBar>

            <NewPatientDialog
                open={isNewPatientDialogOpen}
                onClose={() => setIsNewPatientDialogOpen(false)}
                onPatientAdded={handlePatientAdded}
            />
            <NewRdvDialog
                open={isNewRdvDialogOpen}
                onClose={() => setIsNewRdvDialogOpen(false)}
                onRdvAdded={handleRdvAdded}
            />
        </>
    );
};

export default TopBar;