import React from 'react';
import { DisputeDetail } from '../features/user/components/DisputeDetail';
import { useLocation } from 'react-router-dom';

export const DisputeDetailPage = () => {
    const location = useLocation();
    const isSeller = location.pathname.includes('/seller/');
    const isAdmin = location.pathname.includes('/admin/');

    if (isAdmin) return <DisputeDetail isAdmin />
    if (isSeller) return <DisputeDetail isSeller />

    return <DisputeDetail />
};
