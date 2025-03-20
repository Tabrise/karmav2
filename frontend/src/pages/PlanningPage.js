import React from 'react';
import { Container, Typography } from '@mui/material';
import PlanningSemaine from '../components/planning/PlanningSemaine';

const PlanningPage = () => {
    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
                Planning
            </Typography>
            <PlanningSemaine />
        </Container>
    );
};

export default PlanningPage; 