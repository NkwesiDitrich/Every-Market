import React from 'react';
import { IconButton, Menu, MenuItem, Typography, Stack, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TranslateIcon from '@mui/icons-material/Translate';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        handleClose();
    };

    const currentLanguage = i18n.language || 'en';

    return (
        <Box>
            <IconButton onClick={handleOpen} color="inherit" size="small" sx={{ borderRadius: 2, bgcolor: 'action.hover', p: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <TranslateIcon fontSize="small" />
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                        {currentLanguage.split('-')[0]}
                    </Typography>
                </Stack>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => changeLanguage('en')} selected={currentLanguage.startsWith('en')}>
                    English
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('fr')} selected={currentLanguage.startsWith('fr')}>
                    Français
                </MenuItem>
            </Menu>
        </Box>
    );
};
