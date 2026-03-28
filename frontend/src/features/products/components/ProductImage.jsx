import React, { useState } from 'react';
import { Avatar, Box } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

// A robust base64 placeholder for when images fail
export const NO_IMAGE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export const ProductImage = ({ src, alt, width = 48, height = 48, variant = "rounded", sx = {}, ...props }) => {
    const [error, setError] = useState(false);

    const handleError = () => {
        if (!error) {
            setError(true);
        }
    };

    if (error || !src) {
        return (
            <Avatar
                variant={variant}
                sx={{ 
                    width, 
                    height, 
                    bgcolor: 'action.hover', 
                    color: 'text.secondary',
                    ...sx 
                }}
                {...props}
            >
                <ImageIcon fontSize={width > 30 ? "medium" : "small"} />
            </Avatar>
        );
    }

    return (
        <Box
            component="img"
            src={src}
            alt={alt}
            onError={handleError}
            sx={{
                width,
                height,
                objectFit: 'cover',
                borderRadius: variant === 'rounded' ? 1.5 : variant === 'circular' ? '50%' : 0,
                bgcolor: 'action.hover',
                ...sx
            }}
            {...props}
        />
    );
};
