import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveRole } from '../AuthSlice';

/**
 * RoleGuard component to conditionally render children based on the active role mode.
 * 
 * @param {Array} roles - List of roles permitted to see the children (e.g., ['buyer', 'seller'])
 * @param {React.ReactNode} children - Elements to render if authorized
 * @param {React.ReactNode} fallback - Optional elements to render if not authorized
 */
export const RoleGuard = ({ roles = [], children, fallback = null }) => {
    const activeRole = useSelector(selectActiveRole);

    if (roles.includes(activeRole)) {
        return <>{children}</>;
    }

    return fallback;
};
