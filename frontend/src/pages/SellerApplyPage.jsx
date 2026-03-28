import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Box, Paper, Stack, TextField, Typography } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { useForm } from "react-hook-form"
import { applyAsSellerAsync, selectSellerProfile, selectSellerProfileStatus } from "../features/seller/SellerSlice"
import { selectLoggedInUser } from "../features/auth/AuthSlice"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

export const SellerApplyPage = () => {
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectLoggedInUser)
  const profileStatus = useSelector(selectSellerProfileStatus)
  const profile = useSelector(selectSellerProfile)
  const { register, handleSubmit } = useForm({
    defaultValues: {
      storeName: "",
      contactEmail: loggedInUser?.email || "",
      contactPhone: "",
      logoUrl: "",
      description: "",
    },
  })
  const navigate = useNavigate()

  const onSubmit = (data) => {
    dispatch(applyAsSellerAsync(data))
      .unwrap()
      .then(() => {
        toast.success("Seller application submitted")
      })
      .catch((e) => {
        const msg = e?.message || "Error submitting application"
        toast.error(msg)
      })
  }

  const existingStatus = profile?.status

  return (
    <Stack width="100vw" minHeight="100vh" justifyContent="center" alignItems="center" p={2}>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 600, width: "100%" }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>
            Become a Seller
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your own shop on Every Market and start selling to thousands of customers.
          </Typography>

          {existingStatus && (
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "background.default", border: "1px solid rgba(0,0,0,0.08)" }}>
              <Typography variant="body2">
                Current application status: <strong>{existingStatus}</strong>
              </Typography>
              {existingStatus === "approved" && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  You can access your seller dashboard from the top menu or{" "}
                  <span
                    style={{ color: "#1976d2", cursor: "pointer" }}
                    onClick={() => navigate("/seller/dashboard")}
                  >
                    click here
                  </span>
                  .
                </Typography>
              )}
            </Box>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField label="Store name" fullWidth required {...register("storeName", { required: true })} />
              <TextField label="Contact email" fullWidth required {...register("contactEmail", { required: true })} />
              <TextField label="Contact phone" fullWidth {...register("contactPhone")} />
              <TextField label="Logo URL" fullWidth {...register("logoUrl")} />
              <TextField
                label="Store description"
                fullWidth
                multiline
                rows={4}
                {...register("description")}
                placeholder="Tell customers what makes your shop special."
              />
              <LoadingButton
                type="submit"
                variant="contained"
                loading={profileStatus === "pending"}
                sx={{ mt: 1 }}
                fullWidth
              >
                Submit application
              </LoadingButton>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  )
}

