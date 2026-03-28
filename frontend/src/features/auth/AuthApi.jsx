import { axiosi } from '../../config/axios'

export const signup = async (cred) => {
    try {
        const res = await axiosi.post("auth/signup", cred)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
export const login = async (cred) => {
    try {
        const res = await axiosi.post("auth/login", cred)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
export const verifyOtp = async (cred) => {
    try {
        const res = await axiosi.post("auth/verify-otp", cred)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
export const verify2FA = async ({ tempToken, otp }) => {
    try {
        const res = await axiosi.post("auth/verify-2fa", { tempToken, otp })
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
export const enable2FA = async () => {
    try {
        const res = await axiosi.post("auth/enable-2fa")
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
export const confirm2FA = async (otp) => {
    try {
        const res = await axiosi.post("auth/confirm-2fa", { otp })
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
export const disable2FA = async () => {
    try {
        const res = await axiosi.post("auth/disable-2fa")
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
export const resendOtp = async (cred) => {
    try {
        const res = await axiosi.post("auth/resend-otp", cred)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
export const forgotPassword = async (cred) => {
    try {
        const res = await axiosi.post("auth/forgot-password", cred)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
export const resetPassword = async (cred) => {
    try {
        const res = await axiosi.post("auth/reset-password", cred)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
export const checkAuth = async (cred) => {
    try {
        const res = await axiosi.get("auth/check-auth")
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
export const logout = async () => {
    try {
        const res = await axiosi.get("auth/logout")
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}