import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { checkAuth, confirm2FA, disable2FA, enable2FA, forgotPassword, login, logout, resendOtp, resetPassword, signup, verify2FA, verifyOtp } from './AuthApi'

const initialState={
    status:"idle",
    errors:null,
    resendOtpStatus:"idle",
    resendOtpSuccessMessage:null,
    resendOtpError:null,
    signupStatus:"idle",
    signupError:null,
    loginStatus:"idle",
    loginError:null,
    loggedInUser:null,
    otpVerificationStatus:"idle",
    otpVerificationError:null,
    forgotPasswordStatus:"idle",
    forgotPasswordSuccessMessage:null,
    forgotPasswordError:null,
    resetPasswordStatus:"idle",
    resetPasswordSuccessMessage:null,
    resetPasswordError:null,
    successMessage:null,
    isAuthChecked:false,
    pending2FAToken:null,
    verify2FAStatus:"idle",
    verify2FAError:null,
    enable2FAStatus:"idle",
    enable2FAError:null,
    confirm2FAStatus:"idle",
    confirm2FAError:null,
    disable2FAStatus:"idle",
    disable2FAError:null,
    activeRole: "buyer" // Default to buyer mode
}

export const signupAsync=createAsyncThunk('auth/signupAsync',async(cred)=>{
    const res=await signup(cred)
    return res
})

export const loginAsync=createAsyncThunk('auth/loginAsync',async(cred)=>{
    const res=await login(cred)
    return res
})

export const verifyOtpAsync=createAsyncThunk('auth/verifyOtpAsync',async(cred)=>{
    const res=await verifyOtp(cred)
    return res
})
export const resendOtpAsync=createAsyncThunk("auth/resendOtpAsync",async(cred)=>{
    const res=await resendOtp(cred)
    return res
})
export const forgotPasswordAsync=createAsyncThunk('auth/forgotPasswordAsync',async(cred)=>{
    const res=await forgotPassword(cred)
    return res
})

export const resetPasswordAsync=createAsyncThunk('auth/resetPasswordAsync',async(cred)=>{
    const res=await resetPassword(cred)
    return res
})

export const checkAuthAsync=createAsyncThunk('auth/checkAuthAsync',async()=>{
    const res=await checkAuth()
    return res
})

export const logoutAsync=createAsyncThunk("auth/logoutAsync",async()=>{
    const res=await logout()
    return res
})

export const verify2FAAsync=createAsyncThunk("auth/verify2FAAsync",async({ tempToken, otp })=>{
    const res=await verify2FA({ tempToken, otp })
    return res
})
export const enable2FAAsync=createAsyncThunk("auth/enable2FAAsync",async()=>{
    const res=await enable2FA()
    return res
})
export const confirm2FAAsync=createAsyncThunk("auth/confirm2FAAsync",async(otp)=>{
    const res=await confirm2FA(otp)
    return res
})
export const disable2FAAsync=createAsyncThunk("auth/disable2FAAsync",async()=>{
    const res=await disable2FA()
    return res
})


const authSlice=createSlice({
    name:"authSlice",
    initialState:initialState,
    reducers:{
        clearAuthSuccessMessage:(state)=>{
            state.successMessage=null
        },
        clearAuthErrors:(state)=>{
            state.errors=null
        },
        resetAuthStatus:(state)=>{
            state.status='idle'
        },
        resetSignupStatus:(state)=>{
            state.signupStatus='idle'
        },
        clearSignupError:(state)=>{
            state.signupError=null
        },
        resetLoginStatus:(state)=>{
            state.loginStatus='idle'
        },
        clearLoginError:(state)=>{
            state.loginError=null
        },
        resetOtpVerificationStatus:(state)=>{
            state.otpVerificationStatus='idle'
        },
        clearOtpVerificationError:(state)=>{
            state.otpVerificationError=null
        },
        resetResendOtpStatus:(state)=>{
            state.resendOtpStatus='idle'
        },
        clearResendOtpError:(state)=>{
            state.resendOtpError=null
        },
        clearResendOtpSuccessMessage:(state)=>{
            state.resendOtpSuccessMessage=null
        },
        resetForgotPasswordStatus:(state)=>{
            state.forgotPasswordStatus='idle'
        },
        clearForgotPasswordSuccessMessage:(state)=>{
            state.forgotPasswordSuccessMessage=null
        },
        clearForgotPasswordError:(state)=>{
            state.forgotPasswordError=null
        },
        resetResetPasswordStatus:(state)=>{
            state.resetPasswordStatus='idle'
        },
        clearResetPasswordSuccessMessage:(state)=>{
            state.resetPasswordSuccessMessage=null
        },
        clearResetPasswordError:(state)=>{
            state.resetPasswordError=null
        },
        clearPending2FA:(state)=>{
            state.pending2FAToken=null
        },
        resetVerify2FAStatus:(state)=>{
            state.verify2FAStatus="idle"
            state.verify2FAError=null
        },
        resetEnable2FAStatus:(state)=>{
            state.enable2FAStatus="idle"
            state.enable2FAError=null
        },
        resetConfirm2FAStatus:(state)=>{
            state.confirm2FAStatus="idle"
            state.confirm2FAError=null
        },
        resetDisable2FAStatus:(state)=>{
            state.disable2FAStatus="idle"
            state.disable2FAError=null
        },
        setActiveRole:(state,action)=>{
            state.activeRole=action.payload
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(signupAsync.pending,(state)=>{
                state.signupStatus='pending'
            })
            .addCase(signupAsync.fulfilled,(state,action)=>{
                state.signupStatus='fullfilled'
                state.loggedInUser=action.payload
            })
            .addCase(signupAsync.rejected,(state,action)=>{
                state.signupStatus='rejected'
                state.signupError=action.error
            })

            .addCase(loginAsync.pending,(state)=>{
                state.loginStatus='pending'
            })
            .addCase(loginAsync.fulfilled,(state,action)=>{
                state.loginStatus='fullfilled'
                if (action.payload?.needsOtp && action.payload?.tempToken) {
                    state.pending2FAToken=action.payload.tempToken
                    state.loggedInUser=null
                    return
                }
                state.loggedInUser=action.payload
            })
            .addCase(loginAsync.rejected,(state,action)=>{
                state.loginStatus='rejected'
                state.loginError=action.error
            })

            .addCase(verifyOtpAsync.pending,(state)=>{
                state.otpVerificationStatus='pending'
            })
            .addCase(verifyOtpAsync.fulfilled,(state,action)=>{
                state.otpVerificationStatus='fullfilled'
                state.loggedInUser=action.payload
            })
            .addCase(verifyOtpAsync.rejected,(state,action)=>{
                state.otpVerificationStatus='rejected'
                state.otpVerificationError=action.error
            })

            .addCase(resendOtpAsync.pending,(state)=>{
                state.resendOtpStatus='pending'
            })
            .addCase(resendOtpAsync.fulfilled,(state,action)=>{
                state.resendOtpStatus='fullfilled'
                state.resendOtpSuccessMessage=action.payload
            })
            .addCase(resendOtpAsync.rejected,(state,action)=>{
                state.resendOtpStatus='rejected'
                state.resendOtpError=action.error
            })

            .addCase(forgotPasswordAsync.pending,(state)=>{
                state.forgotPasswordStatus='pending'
            })
            .addCase(forgotPasswordAsync.fulfilled,(state,action)=>{
                state.forgotPasswordStatus='fullfilled'
                state.forgotPasswordSuccessMessage=action.payload
            })
            .addCase(forgotPasswordAsync.rejected,(state,action)=>{
                state.forgotPasswordStatus='rejected'
                state.forgotPasswordError=action.error
            })

            .addCase(resetPasswordAsync.pending,(state)=>{
                state.resetPasswordStatus='pending'
            })
            .addCase(resetPasswordAsync.fulfilled,(state,action)=>{
                state.resetPasswordStatus='fullfilled'
                state.resetPasswordSuccessMessage=action.payload
            })
            .addCase(resetPasswordAsync.rejected,(state,action)=>{
                state.resetPasswordStatus='rejected'
                state.resetPasswordError=action.error
            })

            .addCase(logoutAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(logoutAsync.fulfilled,(state)=>{
                state.status='fullfilled'
                state.loggedInUser=null
            })
            .addCase(logoutAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(checkAuthAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(checkAuthAsync.fulfilled,(state,action)=>{
                state.status='fullfilled'
                state.loggedInUser=action.payload
                state.isAuthChecked=true
                // Initialize activeRole based on user roles if not already set or if user is only a seller
                if (action.payload) {
                    if (action.payload.role === 'admin') {
                        state.activeRole = 'admin';
                    } else if (action.payload.role === 'seller') {
                        state.activeRole = 'seller';
                    } else {
                        state.activeRole = 'buyer';
                    }
                }
            })
            .addCase(checkAuthAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
                state.isAuthChecked=true
            })

            .addCase(verify2FAAsync.pending,(state)=>{
                state.verify2FAStatus='pending'
                state.verify2FAError=null
            })
            .addCase(verify2FAAsync.fulfilled,(state,action)=>{
                state.verify2FAStatus='fullfilled'
                state.loggedInUser=action.payload
                state.pending2FAToken=null
            })
            .addCase(verify2FAAsync.rejected,(state,action)=>{
                state.verify2FAStatus='rejected'
                state.verify2FAError=action.payload || action.error
            })

            .addCase(enable2FAAsync.pending,(state)=>{
                state.enable2FAStatus='pending'
                state.enable2FAError=null
            })
            .addCase(enable2FAAsync.fulfilled,(state)=>{
                state.enable2FAStatus='fullfilled'
            })
            .addCase(enable2FAAsync.rejected,(state,action)=>{
                state.enable2FAStatus='rejected'
                state.enable2FAError=action.payload || action.error
            })

            .addCase(confirm2FAAsync.pending,(state)=>{
                state.confirm2FAStatus='pending'
                state.confirm2FAError=null
            })
            .addCase(confirm2FAAsync.fulfilled,(state,action)=>{
                state.confirm2FAStatus='fullfilled'
            })
            .addCase(confirm2FAAsync.rejected,(state,action)=>{
                state.confirm2FAStatus='rejected'
                state.confirm2FAError=action.payload || action.error
            })

            .addCase(disable2FAAsync.pending,(state)=>{
                state.disable2FAStatus='pending'
                state.disable2FAError=null
            })
            .addCase(disable2FAAsync.fulfilled,(state,action)=>{
                state.disable2FAStatus='fullfilled'
                if (state.loggedInUser) state.loggedInUser={ ...state.loggedInUser, twoFactorEnabled: false }
            })
            .addCase(disable2FAAsync.rejected,(state,action)=>{
                state.disable2FAStatus='rejected'
                state.disable2FAError=action.payload || action.error
            })
            
    }
})


// exporting selectors
export const selectAuthStatus=(state)=>state.AuthSlice.status
export const selectAuthErrors=(state)=>state.AuthSlice.errors
export const selectLoggedInUser=(state)=>state.AuthSlice.loggedInUser
export const selectAuthSuccessMessage=(state)=>state.AuthSlice.successMessage
export const selectIsAuthChecked=(state)=>state.AuthSlice.isAuthChecked
export const selectResendOtpStatus=(state)=>state.AuthSlice.resendOtpStatus
export const selectResendOtpSuccessMessage=(state)=>state.AuthSlice.resendOtpSuccessMessage
export const selectResendOtpError=(state)=>state.AuthSlice.resendOtpError
export const selectSignupStatus=(state)=>state.AuthSlice.signupStatus
export const selectSignupError=(state)=>state.AuthSlice.signupError
export const selectLoginStatus=(state)=>state.AuthSlice.loginStatus
export const selectLoginError=(state)=>state.AuthSlice.loginError
export const selectOtpVerificationStatus=(state)=>state.AuthSlice.otpVerificationStatus
export const selectOtpVerificationError=(state)=>state.AuthSlice.otpVerificationError
export const selectForgotPasswordStatus=(state)=>state.AuthSlice.forgotPasswordStatus
export const selectForgotPasswordSuccessMessage=(state)=>state.AuthSlice.forgotPasswordSuccessMessage
export const selectForgotPasswordError=(state)=>state.AuthSlice.forgotPasswordError
export const selectResetPasswordStatus=(state)=>state.AuthSlice.resetPasswordStatus
export const selectResetPasswordSuccessMessage=(state)=>state.AuthSlice.resetPasswordSuccessMessage
export const selectResetPasswordError=(state)=>state.AuthSlice.resetPasswordError
export const selectPending2FAToken=(state)=>state.AuthSlice.pending2FAToken
export const selectVerify2FAStatus=(state)=>state.AuthSlice.verify2FAStatus
export const selectVerify2FAError=(state)=>state.AuthSlice.verify2FAError
export const selectEnable2FAStatus=(state)=>state.AuthSlice.enable2FAStatus
export const selectEnable2FAError=(state)=>state.AuthSlice.enable2FAError
export const selectConfirm2FAStatus=(state)=>state.AuthSlice.confirm2FAStatus
export const selectConfirm2FAError=(state)=>state.AuthSlice.confirm2FAError
export const selectDisable2FAStatus=(state)=>state.AuthSlice.disable2FAStatus
export const selectDisable2FAError=(state)=>state.AuthSlice.disable2FAError
export const selectActiveRole=(state)=>state.AuthSlice.activeRole

// exporting reducers
export const {setActiveRole,clearAuthSuccessMessage,clearAuthErrors,resetAuthStatus,clearSignupError,resetSignupStatus,clearLoginError,resetLoginStatus,clearOtpVerificationError,resetOtpVerificationStatus,clearResendOtpError,clearResendOtpSuccessMessage,resetResendOtpStatus,clearForgotPasswordError,clearForgotPasswordSuccessMessage,resetForgotPasswordStatus,clearResetPasswordError,clearResetPasswordSuccessMessage,resetResetPasswordStatus,clearPending2FA,resetVerify2FAStatus,resetEnable2FAStatus,resetConfirm2FAStatus,resetDisable2FAStatus}=authSlice.actions

export default authSlice.reducer

