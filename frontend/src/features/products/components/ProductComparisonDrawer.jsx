import React from 'react';
import { 
    Drawer, Box, Stack, Typography, Button, 
    IconButton, Avatar, Badge, Chip, useTheme, alpha 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useDispatch, useSelector } from 'react-redux';
import { clearComparison, removeFromComparison, selectComparisonList } from '../ProductSlice';
import { useNavigate } from 'react-router-dom';

export const ProductComparisonDrawer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const comparisonList = useSelector(selectComparisonList);

    if (comparisonList.length === 0) return null;

    return (
        <Drawer
            anchor="bottom"
            open={comparisonList.length > 0}
            variant="persistent"
            PaperProps={{
                sx: { 
                    maxHeight: 'auto', 
                    bgcolor: 'rgba(255,255,255,0.95)', 
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid ' + theme.palette.divider,
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
                }
            }}
        >
            <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ bgcolor: 'primary.main', color: '#fff', p: 1, borderRadius: 2 }}>
                            <CompareArrowsIcon />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800}>Compare Products</Typography>
                            <Typography variant="caption" color="text.secondary">Select up to 4 items to compare side-by-side</Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ flex: 1, justifyContent: 'center', overflowX: 'auto', py: 1 }}>
                        {comparisonList.map((product) => (
                            <Box key={product._id} sx={{ position: 'relative' }}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    badgeContent={
                                        <IconButton 
                                            size="small" 
                                            onClick={() => dispatch(removeFromComparison(product._id))}
                                            sx={{ bgcolor: '#fff', boxShadow: 1, '&:hover': { bgcolor: '#f0f0f0' }, width: 20, height: 20 }}
                                        >
                                            <CloseIcon sx={{ fontSize: 12 }} />
                                        </IconButton>
                                    }
                                >
                                    <Avatar 
                                        src={product.thumbnail} 
                                        variant="rounded" 
                                        sx={{ width: 60, height: 60, bgcolor: '#f5f5f5', border: '2px solid transparent', '&:hover': { borderColor: 'primary.main' } }} 
                                    />
                                </Badge>
                                <Typography variant="caption" noWrap sx={{ display: 'block', width: 60, textAlign: 'center', mt: 0.5, fontSize: '0.65rem' }}>
                                    {product.title}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Button 
                            variant="text" 
                            color="inherit" 
                            onClick={() => dispatch(clearComparison())}
                            startIcon={<DeleteOutlineIcon />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Clear
                        </Button>
                        <Button 
                            variant="contained" 
                            disabled={comparisonList.length < 2}
                            onClick={() => navigate('/compare')}
                            sx={{ px: 4, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                        >
                            Compare Now
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Drawer>
    );
};
