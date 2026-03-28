import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Alert, AlertTitle, Box, Collapse, IconButton,
    Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Button, Typography
} from '@mui/material';
import { Close as CloseIcon, Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import {
    selectBanner, clearBanner,
    selectCriticalModal, clearCriticalModal
} from '../NotificationSlice';
import { useNavigate } from 'react-router-dom';

export const GlobalAlertManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const banner = useSelector(selectBanner);
    const modal = useSelector(selectCriticalModal);

    const handleAction = () => {
        if (modal?.actionLink) {
            navigate(modal.actionLink);
        }
        dispatch(clearCriticalModal());
    };

    return (
        <>
            {/* Global Sticky Banner */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 2000, width: '100%' }}>
                <Collapse in={!!banner}>
                    {banner && (
                        <Alert
                            severity={banner.type || 'info'}
                            variant="filled"
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => dispatch(clearBanner())}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                            sx={{ borderRadius: 0 }}
                        >
                            {banner.message}
                        </Alert>
                    )}
                </Collapse>
            </Box>

            {/* Critical Modal */}
            <Dialog
                open={!!modal}
                onClose={() => !modal?.blocking && dispatch(clearCriticalModal())}
                aria-labelledby="critical-modal-title"
                aria-describedby="critical-modal-description"
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 2, gap: 2 }}>
                    {modal?.type === 'error' ? <ErrorIcon color="error" fontSize="large" /> : <WarningIcon color="warning" fontSize="large" />}
                    <DialogTitle id="critical-modal-title" sx={{ p: 0, fontWeight: 'bold' }}>
                        {modal?.title || 'System Alert'}
                    </DialogTitle>
                </Box>
                <DialogContent>
                    <DialogContentText id="critical-modal-description" sx={{ mt: 1 }}>
                        {modal?.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    {!modal?.blocking && (
                        <Button onClick={() => dispatch(clearCriticalModal())} color="inherit">
                            Dismiss
                        </Button>
                    )}
                    <Button
                        onClick={handleAction}
                        variant="contained"
                        color={modal?.type === 'error' ? 'error' : 'primary'}
                        autoFocus
                        sx={{ borderRadius: 2 }}
                    >
                        {modal?.actionLabel || 'Understand'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
