import React from 'react';
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText,
    Typography,
    Divider,
    Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5',
        marginTop: 64, // Hauteur de la TopBar
    },
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
    margin: '4px 8px',
    borderRadius: '4px',
    backgroundColor: active ? '#e0e0e0' : 'transparent',
    '&:hover': {
        backgroundColor: '#e0e0e0',
    },
}));

const SideBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Accueil', icon: <HomeIcon />, path: '/' },
        { text: 'Mon profil', icon: <PersonIcon />, path: '/profile' },
        { text: 'Planning journalier', icon: <CalendarTodayIcon />, path: '/planning-jour' },
        { text: 'Planning semaine', icon: <DateRangeIcon />, path: '/planning' },
        { text: 'Disponibilités praticiens', icon: <AccessTimeIcon />, path: '/disponibilites' },
        { text: 'Liste des rendez-vous', icon: <ListAltIcon />, path: '/rendez-vous' },
        { text: 'Liste des patients', icon: <PeopleIcon />, path: '/patients' },
    ];

    const adminItems = [
        { text: 'Liste des utilisateurs', icon: <AdminPanelSettingsIcon />, path: '/users' },
    ];

    return (
        <StyledDrawer variant="permanent">
            <List>
                {menuItems.map((item) => (
                    <StyledListItem
                        key={item.text}
                        button
                        active={location.pathname === item.path ? 1 : 0}
                        onClick={() => navigate(item.path)}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </StyledListItem>
                ))}

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ px: 2, mb: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Administration
                    </Typography>
                </Box>

                {adminItems.map((item) => (
                    <StyledListItem
                        key={item.text}
                        button
                        active={location.pathname === item.path ? 1 : 0}
                        onClick={() => navigate(item.path)}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </StyledListItem>
                ))}
            </List>
        </StyledDrawer>
    );
};

export default SideBar;