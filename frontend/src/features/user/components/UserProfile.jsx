import { Avatar, Button, IconButton, Paper, Stack, Typography, useTheme, TextField, useMediaQuery, Box, Grid } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import SecurityIcon from '@mui/icons-material/Security'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUserInfo, fetchLoggedInUserByIdAsync, updateUserByIdAsync, selectUserStatus, subscribeToPushAsync, unsubscribeFromPushAsync } from '../UserSlice'
import { addAddressAsync, resetAddressAddStatus, resetAddressDeleteStatus, resetAddressUpdateStatus, selectAddressAddStatus, selectAddressDeleteStatus, selectAddressStatus, selectAddressUpdateStatus, selectAddresses } from '../../address/AddressSlice'
import { Address } from '../../address/components/Address'
import { useForm } from 'react-hook-form'
import { LoadingButton } from '@mui/lab'
import { toast } from 'react-toastify'
import { enable2FAAsync, confirm2FAAsync, disable2FAAsync, selectEnable2FAStatus, selectConfirm2FAStatus, selectDisable2FAStatus, selectEnable2FAError, selectConfirm2FAError, selectDisable2FAError, resetEnable2FAStatus, resetConfirm2FAStatus, resetDisable2FAStatus, checkAuthAsync } from '../../auth/AuthSlice'
import { useTranslation } from 'react-i18next'

export const UserProfile = () => {
    const dispatch = useDispatch()
    const { register, handleSubmit, reset } = useForm()
    const userInfo = useSelector(selectUserInfo)
    const addresses = useSelector(selectAddresses)
    const theme = useTheme()
    const [addAddress, setAddAddress] = useState(false)
    const [show2FAConfirm, setShow2FAConfirm] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [activeTab, setActiveTab] = useState(0)

    const addressAddStatus = useSelector(selectAddressAddStatus)
    const addressUpdateStatus = useSelector(selectAddressUpdateStatus)
    const addressDeleteStatus = useSelector(selectAddressDeleteStatus)
    const userUpdateStatus = useSelector(selectUserStatus)

    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const { t } = useTranslation()

    const enable2FAStatus = useSelector(selectEnable2FAStatus)
    const confirm2FAStatus = useSelector(selectConfirm2FAStatus)
    const disable2FAStatus = useSelector(selectDisable2FAStatus)
    const enable2FAError = useSelector(selectEnable2FAError)
    const confirm2FAError = useSelector(selectConfirm2FAError)
    const disable2FAError = useSelector(selectDisable2FAError)

    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" })
    }, [])

    useEffect(() => {
        if (addressAddStatus === 'fulfilled') toast.success(t('auth.addresses.toastAddSuccess'))
        else if (addressAddStatus === 'rejected') toast.error(t('auth.addresses.toastAddError'))
    }, [addressAddStatus, t])

    useEffect(() => {
        if (addressUpdateStatus === 'fulfilled') toast.success(t('auth.addresses.toastUpdateSuccess'))
        else if (addressUpdateStatus === 'rejected') toast.error(t('auth.addresses.toastUpdateError'))
    }, [addressUpdateStatus, t])

    useEffect(() => {
        if (addressDeleteStatus === 'fulfilled') toast.success(t('auth.addresses.toastDeleteSuccess'))
        else if (addressDeleteStatus === 'rejected') toast.error(t('auth.addresses.toastDeleteError'))
    }, [addressDeleteStatus, t])

    useEffect(() => {
        if (userUpdateStatus === 'fulfilled' && isEdit) {
            toast.success(t('auth.profile.updateSuccess'))
            setIsEdit(false)
        }
        else if (userUpdateStatus === 'rejected' && isEdit) toast.error(t('auth.profile.updateError'))
    }, [userUpdateStatus, isEdit, t])

    useEffect(() => {
        return () => {
            dispatch(resetAddressAddStatus())
            dispatch(resetAddressUpdateStatus())
            dispatch(resetAddressDeleteStatus())
        }
    }, [dispatch])

    useEffect(() => {
        if (enable2FAStatus === 'fulfilled') { setShow2FAConfirm(true); dispatch(resetEnable2FAStatus()) }
        if (enable2FAStatus === 'rejected') { toast.error(enable2FAError?.message || t('auth.profile.twoFaSendFailed')); dispatch(resetEnable2FAStatus()) }
    }, [enable2FAStatus, enable2FAError, dispatch, t])

    useEffect(() => {
        if (confirm2FAStatus === 'fulfilled') {
            toast.success(t('auth.profile.twoFaEnabledToast'))
            setShow2FAConfirm(false)
            dispatch(fetchLoggedInUserByIdAsync(userInfo?._id))
            dispatch(checkAuthAsync())
            dispatch(resetConfirm2FAStatus())
        }
        if (confirm2FAStatus === 'rejected') {
            toast.error(confirm2FAError?.message || t('auth.login.error2faInvalid'))
            dispatch(resetConfirm2FAStatus())
        }
    }, [confirm2FAStatus, confirm2FAError, userInfo?._id, dispatch, t])

    useEffect(() => {
        if (disable2FAStatus === 'fulfilled') {
            toast.success(t('auth.profile.twoFaDisabledToast'))
            dispatch(fetchLoggedInUserByIdAsync(userInfo?._id))
            dispatch(checkAuthAsync())
            dispatch(resetDisable2FAStatus())
        }
        if (disable2FAStatus === 'rejected') {
            toast.error(disable2FAError?.message || t('auth.profile.twoFaDisableFailed'))
            dispatch(resetDisable2FAStatus())
        }
    }, [disable2FAStatus, disable2FAError, userInfo?._id, dispatch, t])

    const handleAddAddress = (data) => {
        const address = { ...data, user: userInfo._id }
        dispatch(addAddressAsync(address))
        setAddAddress(false)
        reset()
    }

    const handleUpdateUser = (data) => {
        dispatch(updateUserByIdAsync({ _id: userInfo._id, ...data }))
    }

    const handleEnable2FA = () => { dispatch(enable2FAAsync()) }
    const handleConfirm2FA = (data) => { dispatch(confirm2FAAsync(data.otp)); reset() }
    const handleDisable2FA = () => { dispatch(disable2FAAsync()) }

    const sections = [
        { id: 0, label: 'Profile Information', icon: <EditIcon /> },
        { id: 1, label: 'Manage Addresses', icon: <IconButton sx={{ p: 0 }}><ArrowBackIcon sx={{ rotate: '180deg' }} /></IconButton> },
        { id: 2, label: 'Security & 2FA', icon: <SecurityIcon /> },
        { id: 3, label: 'Notifications', icon: <NotificationsIcon /> },
        { id: 4, label: 'Referrals', icon: <ContentCopyIcon /> }
    ]

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 6 } }}>

                {/* Header */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" sx={{ mb: 6 }}>
                    <Avatar
                        src={userInfo?.profilePicture}
                        alt={userInfo?.name}
                        sx={{ width: 100, height: 100, border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h4" fontWeight={800}>{userInfo?.name}</Typography>
                        <Typography variant="body1" color="text.secondary">{userInfo?.email}</Typography>
                    </Box>
                </Stack>

                <Grid container spacing={4}>

                    {/* Sidebar / Tabs */}
                    <Grid item xs={12} md={3}>
                        <Paper elevation={0} sx={{ p: 1, borderRadius: 4, border: '1px solid #F0F0F0', bgcolor: '#fff' }}>
                            <Stack spacing={0.5}>
                                {sections.map((sec) => (
                                    <Button
                                        key={sec.id}
                                        fullWidth
                                        variant={activeTab === sec.id ? 'contained' : 'text'}
                                        onClick={() => setActiveTab(sec.id)}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            py: 1.5,
                                            px: 2,
                                            borderRadius: 2,
                                            color: activeTab === sec.id ? '#fff' : 'text.primary',
                                            bgcolor: activeTab === sec.id ? 'primary.main' : 'transparent',
                                            '&:hover': { bgcolor: activeTab === sec.id ? 'primary.dark' : 'rgba(0,0,0,0.02)' },
                                            fontWeight: 600
                                        }}
                                        startIcon={sec.icon}
                                    >
                                        {sec.label}
                                    </Button>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Content Area */}
                    <Grid item xs={12} md={9}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, border: '1px solid #F0F0F0', minHeight: 400 }}>

                            {/* Profile Info */}
                            {activeTab === 0 && (
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                        <Typography variant="h5" fontWeight={700}>Profile Details</Typography>
                                        {!isEdit && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => { setIsEdit(true); resetEdit({ name: userInfo.name, email: userInfo.email, profilePicture: userInfo.profilePicture }) }}
                                            >
                                                Edit Profile
                                            </Button>
                                        )}
                                    </Stack>

                                    {!isEdit ? (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Full Name</Typography>
                                                <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>{userInfo?.name}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Email Address</Typography>
                                                <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>{userInfo?.email}</Typography>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Stack component="form" spacing={3} noValidate onSubmit={handleSubmitEdit(handleUpdateUser)}>
                                            <TextField label="Full Name" fullWidth {...registerEdit('name')} />
                                            <TextField label="Email Address" fullWidth {...registerEdit('email')} />
                                            <TextField label="Profile Picture URL" fullWidth {...registerEdit('profilePicture')} />
                                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                                <LoadingButton loading={userUpdateStatus === 'pending'} type="submit" variant="contained">Save Changes</LoadingButton>
                                                <Button variant="text" color="inherit" onClick={() => setIsEdit(false)}>Cancel</Button>
                                            </Stack>
                                        </Stack>
                                    )}
                                </Box>
                            )}

                            {/* Addresses */}
                            {activeTab === 1 && (
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                        <Typography variant="h5" fontWeight={700}>My Addresses</Typography>
                                        {!addAddress && (
                                            <Button variant="contained" onClick={() => setAddAddress(true)}>Add New</Button>
                                        )}
                                    </Stack>

                                    {addAddress && (
                                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#FAFAFA', border: '1px solid #EDEDED', mb: 4 }}>
                                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>Add New Address</Typography>
                                            <Stack component="form" spacing={2.5} onSubmit={handleSubmit(handleAddAddress)}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Address Type" {...register("type", { required: true })} /></Grid>
                                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name" {...register("fullName")} /></Grid>
                                                    <Grid item xs={12}><TextField fullWidth label="Street Address" {...register("street", { required: true })} /></Grid>
                                                    <Grid item xs={12} sm={6}><TextField fullWidth label="City" {...register("city", { required: true })} /></Grid>
                                                    <Grid item xs={12} sm={6}><TextField fullWidth label="State" {...register("state", { required: true })} /></Grid>
                                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Postal Code" {...register("postalCode", { required: true })} /></Grid>
                                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Country" {...register("country", { required: true })} /></Grid>
                                                    <Grid item xs={12}><TextField fullWidth label="Phone Number" {...register("phoneNumber", { required: true })} /></Grid>
                                                </Grid>
                                                <Stack direction="row" spacing={2}>
                                                    <LoadingButton loading={addressAddStatus === 'pending'} type="submit" variant="contained">Save Address</LoadingButton>
                                                    <Button variant="text" color="inherit" onClick={() => setAddAddress(false)}>Cancel</Button>
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    )}

                                    <Stack spacing={2}>
                                        {addresses.map((address) => (
                                            <Address key={address._id} id={address._id} city={address.city} country={address.country} phoneNumber={address.phoneNumber} postalCode={address.postalCode} state={address.state} street={address.street} type={address.type} />
                                        ))}
                                        {addresses.length === 0 && (
                                            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>No addresses saved yet.</Typography>
                                        )}
                                    </Stack>
                                </Box>
                            )}

                            {/* Security & 2FA */}
                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>Security Settings</Typography>

                                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#FAFAFA', border: '1px solid #EDEDED' }}>
                                        <Stack direction="row" spacing={2} alignItems="flex-start">
                                            <SecurityIcon color="primary" sx={{ mt: 0.5 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" fontWeight={700}>Two-Factor Authentication (2FA)</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                    Add an extra layer of security to your account. When enabled, you'll need to enter a code sent to your email to log in.
                                                </Typography>

                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <Box
                                                        sx={{
                                                            px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700,
                                                            bgcolor: userInfo?.twoFactorEnabled ? 'success.light' : 'action.disabledBackground',
                                                            color: userInfo?.twoFactorEnabled ? 'success.main' : 'text.disabled'
                                                        }}
                                                    >
                                                        {userInfo?.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                                                    </Box>

                                                    {userInfo?.twoFactorEnabled ? (
                                                        <LoadingButton color="error" variant="outlined" size="small" loading={disable2FAStatus === 'pending'} onClick={handleDisable2FA}>
                                                            Disable 2FA
                                                        </LoadingButton>
                                                    ) : (
                                                        !show2FAConfirm ? (
                                                            <LoadingButton variant="contained" size="small" loading={enable2FAStatus === 'pending'} onClick={handleEnable2FA}>
                                                                Enable 2FA
                                                            </LoadingButton>
                                                        ) : (
                                                            <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(handleConfirm2FA)}>
                                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Enter OTP sent to your email:</Typography>
                                                                <Stack direction="row" spacing={1}>
                                                                    <TextField size="small" placeholder="6-digit code" {...register('otp', { required: true })} sx={{ maxWidth: 150 }} />
                                                                    <LoadingButton type="submit" variant="contained" loading={confirm2FAStatus === 'pending'}>Verify</LoadingButton>
                                                                    <Button variant="text" size="small" onClick={() => setShow2FAConfirm(false)}>Cancel</Button>
                                                                </Stack>
                                                            </Stack>
                                                        )
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}

                            {/* Notifications */}
                            {activeTab === 3 && (
                                <Box>
                                    <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>Notification Settings</Typography>
                                    
                                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#FAFAFA', border: '1px solid #EDEDED' }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" fontWeight={700}>Push Notifications</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    Get real-time updates on your order status, price drops, and exclusive offers directly in your browser.
                                                </Typography>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => {
                                                        // Mock subscription for demonstration
                                                        dispatch(subscribeToPushAsync({ endpoint: "mock-endpoint", keys: { auth: "mock-auth", p256dh: "mock-p256dh" } }))
                                                        toast.success("Push notifications enabled (Simulation)")
                                                    }}
                                                >
                                                    Enable Notifications
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}

                            {/* Referrals */}
                            {activeTab === 4 && (
                                <Box>
                                    <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>Earn Rewards</Typography>

                                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'primary.main', color: '#fff' }}>
                                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Refer a Friend</Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                                            Share your code with friends and family. They get a discount on their first order, and you earn loyalty points!
                                        </Typography>

                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 3 }}>
                                            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 2 }}>{userInfo?.referralCode || 'NOT_AVAILABLE'}</Typography>
                                            <IconButton
                                                onClick={() => { navigator.clipboard.writeText(userInfo?.referralCode); toast.success('Referral code copied!') }}
                                                sx={{ color: '#fff' }}
                                            >
                                                <ContentCopyIcon />
                                            </IconButton>
                                        </Stack>
                                    </Paper>

                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Your Referral Link:</Typography>
                                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #EDEDED', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {window.location.origin}/signup?ref={userInfo?.referralCode}
                                            </Typography>
                                            <Button
                                                size="small"
                                                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userInfo?.referralCode}`); toast.success('Link copied!') }}
                                            >
                                                Copy Link
                                            </Button>
                                        </Paper>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                </Grid>
            </Box>
        </Box>
    )
}
