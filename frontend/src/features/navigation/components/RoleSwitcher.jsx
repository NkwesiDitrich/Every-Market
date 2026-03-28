import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography, styled } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveRole, setActiveRole, selectLoggedInUser } from '../../auth/AuthSlice';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StoreIcon from '@mui/icons-material/Store';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useTranslation } from 'react-i18next';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: '24px',
  padding: '4px',
  border: 'none',
  '& .MuiToggleButtonGroup-grouped': {
    margin: '4px',
    border: 0,
    borderRadius: '20px',
    padding: '6px 16px',
    textTransform: 'none',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&.Mui-selected': {
      boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
    },
  },
}));

const BuyerToggle = styled(ToggleButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + ' !important',
    color: '#fff !important',
  },
}));

const SellerToggle = styled(ToggleButton)(({ theme }) => ({
  color: theme.palette.success.main,
  '&.Mui-selected': {
    backgroundColor: theme.palette.success.main + ' !important',
    color: '#fff !important',
  },
}));

const AdminToggle = styled(ToggleButton)(({ theme }) => ({
  color: theme.palette.secondary.main, // Deep Purple/Red base
  '&.Mui-selected': {
    backgroundColor: theme.palette.secondary.main + ' !important',
    color: '#fff !important',
  },
}));

export const RoleSwitcher = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeRole = useSelector(selectActiveRole);
  const user = useSelector(selectLoggedInUser);

  // Only show switcher if user is a seller or admin
  if (!user || (user.role !== 'seller' && user.role !== 'admin' && !user.isAdmin)) {
    return null;
  }

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      dispatch(setActiveRole(newRole));
    }
  };

  const isUserAdmin = user.role === 'admin' || user.isAdmin;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <StyledToggleButtonGroup
        value={activeRole === 'admin' || activeRole === 'seller' ? activeRole : 'buyer'}
        exclusive
        onChange={handleRoleChange}
        aria-label="role switcher"
        size="small"
      >
        <BuyerToggle value="buyer" aria-label="buyer mode">
          <ShoppingBagIcon fontSize="small" />
          <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {t('Buyer')}
          </Typography>
        </BuyerToggle>

        {isUserAdmin ? (
          <AdminToggle value="admin" aria-label="admin mode">
            <AdminPanelSettingsIcon fontSize="small" />
            <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {t('Admin')}
            </Typography>
          </AdminToggle>
        ) : (
          <SellerToggle value="seller" aria-label="seller mode">
            <StoreIcon fontSize="small" />
            <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {t('Seller')}
            </Typography>
          </SellerToggle>
        )}
      </StyledToggleButtonGroup>
    </Box>
  );
};
