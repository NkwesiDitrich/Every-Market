import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export const ProductBanner = ({ images }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeStep, setActiveStep] = useState(0);
    const [direction, setDirection] = useState(0); // 1 for right, -1 for left
    const safeImages = images ?? [];
    const maxSteps = safeImages.length;

    const handleNext = useCallback(() => {
        setDirection(1);
        setActiveStep((prev) => (prev + 1) % maxSteps);
    }, [maxSteps]);

    const handleBack = useCallback(() => {
        setDirection(-1);
        setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);
    }, [maxSteps]);

    // Auto-play logic
    useEffect(() => {
        if (maxSteps <= 1) return;
        const timer = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(timer);
    }, [handleNext, maxSteps]);

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    if (maxSteps === 0) return null;

    return (
        <Box 
            sx={{ 
                position: 'relative', 
                width: '100%', 
                overflow: 'hidden',
                aspectRatio: { xs: '16/9', md: '21/7', lg: '21/6' },
                bgcolor: '#f5f5f5',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={activeStep}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        component="img"
                        src={safeImages[activeStep]}
                        alt={`Banner ${activeStep + 1}`}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {maxSteps > 1 && (
                <>
                    <IconButton
                        onClick={(e) => { e.stopPropagation(); handleBack(); }}
                        sx={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.6)' },
                            display: { xs: 'none', sm: 'flex' }
                        }}
                    >
                        <KeyboardArrowLeftIcon />
                    </IconButton>
                    <IconButton
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.6)' },
                            display: { xs: 'none', sm: 'flex' }
                        }}
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>

                    {/* Dots Indicator */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 2,
                            display: 'flex',
                            gap: 1
                        }}
                    >
                        {safeImages.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => {
                                    setDirection(index > activeStep ? 1 : -1);
                                    setActiveStep(index);
                                }}
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: index === activeStep ? '#fff' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    transform: index === activeStep ? 'scale(1.2)' : 'scale(1)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            />
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};
