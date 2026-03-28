import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { fetchLoggedInUserById, updateUserById, subscribeToPush, unsubscribeFromPush } from './UserApi'

const initialState={
    status:"idle",
    userInfo:null,
    errors:null,
    successMessage:null
}

export const fetchLoggedInUserByIdAsync=createAsyncThunk('user/fetchLoggedInUserByIdAsync',async(id)=>{
    const userInfo=await fetchLoggedInUserById(id)
    return userInfo
})
export const updateUserByIdAsync=createAsyncThunk('user/updateUserByIdAsync',async(update)=>{
    const updatedUser=await updateUserById(update)
    return updatedUser
})
export const subscribeToPushAsync=createAsyncThunk('user/subscribeToPushAsync',async(subscription)=>{
    const response=await subscribeToPush(subscription)
    return response
})
export const unsubscribeFromPushAsync=createAsyncThunk('user/unsubscribeFromPushAsync',async(endpoint)=>{
    const response=await unsubscribeFromPush(endpoint)
    return response
})

const userSlice=createSlice({
    name:"userSlice",
    initialState:initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(fetchLoggedInUserByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(fetchLoggedInUserByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.userInfo=action.payload
            })
            .addCase(fetchLoggedInUserByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(updateUserByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(updateUserByIdAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.userInfo=action.payload
            })
            .addCase(updateUserByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(subscribeToPushAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(subscribeToPushAsync.fulfilled,(state)=>{
                state.status='fulfilled'
            })
            .addCase(subscribeToPushAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(unsubscribeFromPushAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(unsubscribeFromPushAsync.fulfilled,(state)=>{
                state.status='fulfilled'
            })
            .addCase(unsubscribeFromPushAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })
    }
})

// exporting selectors
export const selectUserStatus=(state)=>state.UserSlice.status
export const selectUserInfo=(state)=>state.UserSlice.userInfo
export const selectUserErrors=(state)=>state.UserSlice.errors
export const selectUserSuccessMessage=(state)=>state.UserSlice.successMessage


export default userSlice.reducer