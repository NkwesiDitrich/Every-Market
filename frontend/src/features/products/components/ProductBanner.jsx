import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from '@mui/material/MobileStepper';
import { Box, useTheme } from '@mui/material';
import { useState } from 'react';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export const ProductBanner = ({ images }) => {
    const theme = useTheme()
    const [activeStep, setActiveStep] = useState(0)
    const safeImages = images ?? []
    const maxSteps = safeImages.length

    const handleStepChange = (step) => {
        setActiveStep(step)
    }

    return (
        <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            <AutoPlaySwipeableViews
                style={{ overflow: 'hidden' }}
                width={'100%'}
                height={'100%'}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={activeStep}
                onChangeIndex={handleStepChange}
                enableMouseEvents
            >
                {safeImages.map((image, index) => (
                    <div key={index} style={{ width: '100%', height: '100%' }}>
                        {Math.abs(activeStep - index) <= 2 ? (
                            <Box
                                component="img"
                                sx={{
                                    width: '100%',
                                    height: { xs: '200px', sm: '300px', md: '450px', lg: '500px' },
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                                src={image}
                                alt={'Banner Image'}
                            />
                        ) : null}
                    </div>
                ))}
            </AutoPlaySwipeableViews>

            {maxSteps > 1 && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'transparent',
                    }}
                >
                    <MobileStepper
                        steps={maxSteps}
                        position="static"
                        activeStep={activeStep}
                        sx={{
                            bgcolor: 'transparent',
                            '& .MuiMobileStepper-dot': { bgcolor: 'rgba(255,255,255,0.5)' },
                            '& .MuiMobileStepper-dotActive': { bgcolor: '#fff' },
                        }}
                    />
                </Box>
            )}
        </Box>
    )
}
