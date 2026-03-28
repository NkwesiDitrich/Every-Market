import React from "react"
import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { selectLoggedInUser } from "../AuthSlice"

export const AdminProtected = ({ children }) => {
  const loggedInUser = useSelector(selectLoggedInUser)
  const location = useLocation()

  if (loggedInUser && loggedInUser.role === "admin" && loggedInUser.isVerified) {
    return children
  }

  if (loggedInUser && loggedInUser.isVerified) {
    return <Navigate to="/" replace />
  }

  return <Navigate to="/admin/login" replace state={{ from: location }} />
}

