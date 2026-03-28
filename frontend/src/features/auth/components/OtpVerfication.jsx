import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearOtpVerificationError, clearResendOtpError, clearResendOtpSuccessMessage, resendOtpAsync, resetOtpVerificationStatus, resetResendOtpStatus, selectLoggedInUser, selectOtpVerificationError, selectOtpVerificationStatus, selectResendOtpError, selectResendOtpStatus, selectResendOtpSuccessMessage, selectSignupStatus, verifyOtpAsync } from '../AuthSlice'
import { Button, FormHelperText, Paper, Stack, TextField, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'


export const OtpVerfication = () => {

    const { register, handleSubmit, formState: { errors } } = useForm()
    const dispatch = useDispatch()
    const loggedInUser = useSelector(selectLoggedInUser)
    const navigate = useNavigate()
    const resendOtpStatus = useSelector(selectResendOtpStatus)
    const resendOtpError = useSelector(selectResendOtpError)
    const resendOtpSuccessMessage = useSelector(selectResendOtpSuccessMessage)
    const otpVerificationStatus = useSelector(selectOtpVerificationStatus)
    const otpVerificationError = useSelector(selectOtpVerificationError)
    const signupStatus = useSelector(selectSignupStatus)
    const { t } = useTranslation()

    const isOtpSent = resendOtpStatus === 'fullfilled' || signupStatus === 'fullfilled' || (loggedInUser && !loggedInUser.isVerified)

    // handles the redirection
    useEffect(() => {
        if (!loggedInUser) {
            navigate('/login')
        }
        else if (loggedInUser && loggedInUser?.isVerified) {
            navigate("/")
        }
    }, [loggedInUser, navigate])

    const handleSendOtp = () => {
        const data = { user: loggedInUser?._id }
        dispatch(resendOtpAsync(data))
    }

    const handleVerifyOtp = (data) => {
        const cred = { ...data, userId: loggedInUser?._id }
        dispatch(verifyOtpAsync(cred))
    }

    // handles resend otp error
    useEffect(() => {
        if (resendOtpError) {
            toast.error(resendOtpError.message)
        }
        return () => {
            dispatch(clearResendOtpError())
        }
    }, [resendOtpError, dispatch])

    // handles resend otp success message
    useEffect(() => {
        if (resendOtpSuccessMessage) {
            toast.success(resendOtpSuccessMessage.message)
        }
        return () => {
            dispatch(clearResendOtpSuccessMessage())
        }
    }, [resendOtpSuccessMessage, dispatch])

    // handles error while verifying otp
    useEffect(() => {
        if (otpVerificationError) {
            toast.error(otpVerificationError.message)
        }
        return () => {
            dispatch(clearOtpVerificationError())
        }
    }, [otpVerificationError, dispatch])

    useEffect(() => {
        if (otpVerificationStatus === 'fullfilled') {
            toast.success(t('auth.otp.successVerified'))
            dispatch(resetResendOtpStatus())
        }
        return () => {
            dispatch(resetOtpVerificationStatus())
        }
    }, [otpVerificationStatus, t, dispatch])

    return (
        <Stack width={'100vw'} height={'100vh'} noValidate flexDirection={'column'} rowGap={3} justifyContent="center" alignItems="center" >


            <Stack component={Paper} elevation={1} position={'relative'} justifyContent={'center'} alignItems={'center'} p={'2rem'} rowGap={'2rem'}>

                <Typography mt={4} variant='h5' fontWeight={500}>{t('auth.otp.title')}</Typography>

                {
                    isOtpSent ? (
                        <Stack width={'100%'} rowGap={'1rem'} component={'form'} noValidate onSubmit={handleSubmit(handleVerifyOtp)}>
                            <Stack rowGap={'1rem'}>
                                <Stack>
                                    <Typography color={'GrayText'}>{t('auth.otp.introSent')}</Typography>
                                    <Typography fontWeight={'600'} color={'GrayText'}>{loggedInUser?.email}</Typography>
                                </Stack>
                                <Stack>
                                    <TextField {...register("otp", { required: t('auth.otp.otpRequired'), minLength: { value: 4, message: t('auth.otp.otpInvalid') } })} fullWidth type='number' />
                                    {errors?.otp && <FormHelperText sx={{ color: "red" }}>{errors.otp.message}</FormHelperText>}
                                </Stack>
                            </Stack>
                            <LoadingButton loading={otpVerificationStatus === 'pending'} type='submit' fullWidth variant='contained'>{t('auth.otp.verify')}</LoadingButton>
                            <Button
                                disabled={resendOtpStatus === 'pending' || otpVerificationStatus === 'pending'}
                                onClick={handleSendOtp}
                                variant="text"
                                size="small"
                                sx={{ alignSelf: 'center', mt: 1 }}
                            >
                                {resendOtpStatus === 'pending' ? t('auth.otp.sending') : t('auth.otp.resend')}
                            </Button>
                        </Stack>
                    ) :
                        <>
                            <Stack>
                                <Typography color={'GrayText'}>{t('auth.otp.introPending')}</Typography>
                                <Typography fontWeight={'600'} color={'GrayText'}>{loggedInUser?.email}</Typography>
                            </Stack>
                            <LoadingButton onClick={handleSendOtp} loading={resendOtpStatus === 'pending'} fullWidth variant='contained'>{t('auth.otp.getOtp')}</LoadingButton>
                        </>
                }

            </Stack>
        </Stack >
    )
}
