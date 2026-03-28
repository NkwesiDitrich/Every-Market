import { Button, Paper, Stack, TextField, Typography, useMediaQuery, useTheme, Box, Grid } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux'
import { deleteAddressByIdAsync, selectAddressErrors, selectAddressStatus, updateAddressByIdAsync } from '../AddressSlice'

export const Address = ({ id, type, street, postalCode, country, phoneNumber, state, city }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const { register, handleSubmit, reset } = useForm()
    const [edit, setEdit] = useState(false)
    const status = useSelector(selectAddressStatus)

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleRemoveAddress = () => {
        dispatch(deleteAddressByIdAsync(id))
    }

    const handleUpdateAddress = (data) => {
        const update = { ...data, _id: id }
        dispatch(updateAddressByIdAsync(update))
        setEdit(false)
    }

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #F0F0F0', bgcolor: '#fff', position: 'relative' }}>
            {!edit ? (
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(0,0,0,0.04)', fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {type}
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => setEdit(true)} sx={{ fontWeight: 700 }}>Edit</Button>
                            <LoadingButton size="small" color="error" loading={status === 'pending'} onClick={handleRemoveAddress} sx={{ fontWeight: 700 }}>Remove</LoadingButton>
                        </Stack>
                    </Stack>

                    <Box>
                        <Typography variant="body1" fontWeight={700}>{street}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {city}, {state} {postalCode}<br />
                            {country}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                            {phoneNumber}
                        </Typography>
                    </Box>
                </Stack>
            ) : (
                <Stack component="form" spacing={2.5} noValidate onSubmit={handleSubmit(handleUpdateAddress)}>
                    <Typography variant="subtitle1" fontWeight={700}>Edit Address</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Address Type" {...register("type", { required: true, defaultValue: type })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Street" {...register("street", { required: true, defaultValue: street })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="City" {...register("city", { required: true, defaultValue: city })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="State" {...register("state", { required: true, defaultValue: state })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Postal Code" {...register("postalCode", { required: true, defaultValue: postalCode })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Country" {...register("country", { required: true, defaultValue: country })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Phone Number" {...register("phoneNumber", { required: true, defaultValue: phoneNumber })} /></Grid>
                    </Grid>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <LoadingButton loading={status === 'pending'} type="submit" variant="contained">Update</LoadingButton>
                        <Button variant="text" color="inherit" onClick={() => { setEdit(false); reset() }}>Cancel</Button>
                    </Stack>
                </Stack>
            )}
        </Paper>
    )
}
