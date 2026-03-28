import { FormHelperText, Stack, TextField, Typography, useMediaQuery, useTheme, Divider, Button } from '@mui/material'
import React, { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ecommerceOutlookAnimation } from '../../../assets'
import { useDispatch, useSelector } from 'react-redux'
import { LoadingButton } from '@mui/lab';
import { selectLoggedInUser, loginAsync, selectLoginStatus, selectLoginError, clearLoginError, resetLoginStatus, selectPending2FAToken, verify2FAAsync, selectVerify2FAStatus, selectVerify2FAError, clearPending2FA, checkAuthAsync } from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export const Login = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectLoginStatus)
  const error = useSelector(selectLoginError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const pending2FAToken = useSelector(selectPending2FAToken)
  const verify2FAStatus = useSelector(selectVerify2FAStatus)
  const verify2FAError = useSelector(selectVerify2FAError)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')
  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))
  const is480 = useMediaQuery(theme.breakpoints.down(480))
  const show2FAStep = Boolean(pending2FAToken)
  const { t } = useTranslation()

  // handles user redirection
  useEffect(() => {
    if (loggedInUser && loggedInUser?.isVerified) {
      const from = location.state?.from?.pathname || "/";

      // Prevent loop if 'from' is an admin/protected path but user doesn't have access
      // or if 'from' is identical to current login path
      const isLoop = from.includes('/login') || (isAdminPath && loggedInUser.role !== 'admin');

      if (isLoop) {
        navigate("/", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
    else if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp")
    }
  }, [loggedInUser, isAdminPath, navigate, location.state])

  // handles login error and toast them
  useEffect(() => {
    if (error) {
      toast.error(error?.message || 'Login failed. Please try again.')
    }
  }, [error, t])

  // 2FA verify error
  useEffect(() => {
    if (verify2FAError) {
      toast.error(verify2FAError?.message || 'Invalid verification code')
    }
  }, [verify2FAError, t])

  // success toasts and cleanup
  useEffect(() => {
    if (status === 'fullfilled' && loggedInUser?.isVerified === true) {
      toast.success('Login successful!')
      reset()
    }
    if (verify2FAStatus === 'fullfilled' && loggedInUser?.isVerified === true) {
      toast.success('Login successful!')
      reset()
    }
    return () => {
      dispatch(clearLoginError())
      dispatch(resetLoginStatus())
    }
  }, [status, verify2FAStatus, loggedInUser, dispatch, reset, t])

  const handleLogin = (data) => {
    const cred = { ...data }
    delete cred.confirmPassword
    dispatch(loginAsync(cred))
  }

  const handleVerify2FA = (data) => {
    dispatch(verify2FAAsync({ tempToken: pending2FAToken, otp: data.otp }))
  }

  const handleBackFrom2FA = () => {
    dispatch(clearPending2FA())
    dispatch(resetLoginStatus())
  }

  const handleGoogleLogin = () => {
    const backendUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000'
    window.location.href = `${backendUrl}/auth/google`
  }

  const handleFacebookLogin = () => {
    const backendUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000'
    window.location.href = `${backendUrl}/auth/facebook`
  }

  // Handle OAuth success redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('oauth') === 'success') {
      dispatch(checkAuthAsync())
      navigate('/')
    } else if (params.get('error')) {
      const error = params.get('error')
      if (error === 'oauth_failed') toast.error('Social login failed')
      else if (error === 'banned') toast.error('Account has been banned')
      else toast.error('Login error. Please try again.')
    }
  }, [location.search, dispatch, navigate, t])

  return (
    <Stack width={'100vw'} height={'100vh'} flexDirection={'row'} sx={{ overflowY: "hidden" }}>

      {
        !is900 &&

        <Stack bgcolor={'black'} flex={1} justifyContent={'center'} >
          <Lottie animationData={ecommerceOutlookAnimation} />
        </Stack>
      }

      <Stack flex={1} justifyContent={'center'} alignItems={'center'}>

        <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>

          <Stack rowGap={'.4rem'}>
            <Typography variant='h2' sx={{ wordBreak: "break-word" }} fontWeight={600}>Login</Typography>
            <Typography alignSelf={'flex-end'} color={'GrayText'} variant='body2'>- Welcome back</Typography>
          </Stack>

        </Stack>

        <Stack mt={4} spacing={2} width={is480 ? "95vw" : '28rem'} component={'form'} noValidate onSubmit={handleSubmit(show2FAStep ? handleVerify2FA : handleLogin)}>

          {show2FAStep ? (
            <>
              <Typography variant="body2" color="text.secondary">Enter the verification code from your authenticator app</Typography>
              <motion.div whileHover={{ y: -5 }}>
                <TextField fullWidth {...register("otp", { required: 'Enter verification code', minLength: { value: 4, message: "Code is 4–8 characters" } })} placeholder="Verification Code" inputProps={{ maxLength: 8 }} />
                {errors.otp && <FormHelperText sx={{ mt: 1 }} error>{errors.otp.message}</FormHelperText>}
              </motion.div>
              <motion.div whileHover={{ scale: 1.020 }} whileTap={{ scale: 1 }}>
                <LoadingButton fullWidth sx={{ height: '2.5rem' }} loading={verify2FAStatus === 'pending'} type="submit" variant="contained">Verify</LoadingButton>
              </motion.div>
              <Typography component="button" type="button" onClick={handleBackFrom2FA} sx={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.palette.primary.main, textAlign: 'center', mt: 1 }}>Back to Login</Typography>
            </>
          ) : (
            <>
              <motion.div whileHover={{ y: -5 }}>
                <TextField fullWidth {...register("email", { required: 'Email is required', pattern: { value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, message: "Enter a valid email" } })} placeholder="Email" />
                {errors.email && <FormHelperText sx={{ mt: 1 }} error>{errors.email.message}</FormHelperText>}
              </motion.div>

              <motion.div whileHover={{ y: -5 }}>
                <TextField type='password' fullWidth {...register("password", { required: 'Password is required' })} placeholder="Password" />
                {errors.password && <FormHelperText sx={{ mt: 1 }} error>{errors.password.message}</FormHelperText>}
              </motion.div>

              <motion.div whileHover={{ scale: 1.020 }} whileTap={{ scale: 1 }}>
                <LoadingButton fullWidth sx={{ height: '2.5rem' }} loading={status === 'pending'} type='submit' variant='contained'>Login</LoadingButton>
              </motion.div>

              <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'}>

                <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.050 }}>
                  <motion.div>
                    <Typography mr={'1.5rem'} sx={{ textDecoration: "none", color: "text.primary" }} to={'/forgot-password'} component={Link}>Forgot Password?</Typography>
                  </motion.div>

                  <motion.div>
                    <Typography sx={{ textDecoration: "none", color: "text.primary" }} to={'/signup'} component={Link}>Don't have an account? <span style={{ color: theme.palette.primary.dark }}>Register</span></Typography>
                  </motion.div>
                </MotionConfig>

              </Stack>
              {!show2FAStep && (
                <>
                  <Divider sx={{ my: 2 }}>Or continue with</Divider>
                  <Stack spacing={1}>
                    <Button variant="outlined" fullWidth onClick={handleGoogleLogin} sx={{ textTransform: 'none' }}>
                      Continue with Google
                    </Button>
                    <Button variant="outlined" fullWidth onClick={handleFacebookLogin} sx={{ textTransform: 'none' }}>
                      Continue with Facebook
                    </Button>
                  </Stack>
                </>
              )}
            </>
          )}

        </Stack>
      </Stack>
    </Stack>
  )
}
