import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TopBar from './components/TopBar';
import SideBar from './components/SideBar';
import Login from './pages/Login';
import PatientList from './pages/PatientList';
import PlanningPage from './pages/PlanningPage';
import DisponibilitesPraticiens from './components/disponibilites/DisponibilitesPraticiens';
import ListeRdv from './components/rdv/ListeRdv';
import PlanningJour from './components/planning/PlanningJour';
const theme = createTheme({
    palette: {
        primary: {
            main: '#00BCD4',
        },
        secondary: {
            main: '#FF4081',
        },
    },
});

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Box sx={{ display: 'flex' }}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/*"
                                element={
                                    <ProtectedRoute>
                                        <TopBar />
                                        <SideBar />
                                        <Box
                                            component="main"
                                            sx={{
                                                flexGrow: 1,
                                                p: 3,
                                                mt: 8,
                                                ml: '240px', // Largeur du SideBar
                                            }}
                                        >
                                            {/* Routes protégées ici */}
                                            <Routes>
                                                <Route path="/" element={<div>Accueil</div>} />
                                                <Route path="/profile" element={<div>Mon profil</div>} />
                                                <Route path="/planning" element={<PlanningPage />} />
                                                <Route path="/disponibilites" element={<DisponibilitesPraticiens />} />
                                                <Route path="/patients" element={<PatientList />} />
                                                <Route path="/rendez-vous" element={<ListeRdv />} />
                                                <Route path="/users" element={<div>Liste des utilisateurs</div>} />
                                                <Route path="*" element={<Navigate to="/" replace />} />
                                                <Route path="/planning-jour" element={<PlanningJour />} />
                                            </Routes>
                                        </Box>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Box>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
