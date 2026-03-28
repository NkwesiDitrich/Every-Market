import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchBannersForAdminAsync,
  selectAdminBanners,
  selectAdminBannersStatus,
} from "../../banner/BannerSlice"
import { createBanner, deleteBanner, updateBanner } from "../../banner/BannerApi"
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { useForm } from "react-hook-form"
import { LoadingButton } from "@mui/lab"
import { toast } from "react-toastify"

export const AdminBanners = () => {
  const dispatch = useDispatch()
  const banners = useSelector(selectAdminBanners)
  const status = useSelector(selectAdminBannersStatus)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    dispatch(fetchBannersForAdminAsync())
  }, [dispatch])

  const handleOpenCreate = () => {
    setEditing(null)
    reset({
      title: "",
      imageUrl: "",
      linkUrl: "",
      priority: 0,
      active: true,
    })
    setOpen(true)
  }

  const handleOpenEdit = (banner) => {
    setEditing(banner)
    reset({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      priority: banner.priority ?? 0,
      active: banner.active,
    })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        priority: Number(data.priority ?? 0),
        active: Boolean(data.active),
      }
      if (editing) {
        await updateBanner({ ...editing, ...payload })
        toast.success("Banner updated")
      } else {
        await createBanner(payload)
        toast.success("Banner created")
      }
      setOpen(false)
      dispatch(fetchBannersForAdminAsync())
    } catch (e) {
      toast.error("Error saving banner")
    }
  }

  const handleDelete = async (banner) => {
    if (!window.confirm("Delete this banner?")) return
    try {
      await deleteBanner(banner._id)
      toast.success("Banner deleted")
      dispatch(fetchBannersForAdminAsync())
    } catch (e) {
      toast.error("Error deleting banner")
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Home Banners
        </Typography>
        <Button variant="contained" onClick={handleOpenCreate}>
          Add banner
        </Button>
      </Stack>

      {status === "pending" && <Typography color="text.secondary">Loading banners…</Typography>}

      <Grid container spacing={2}>
        {banners.map((banner) => (
          <Grid key={banner._id} item xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "16/9",
                  bgcolor: "background.default",
                  overflow: "hidden",
                }}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <CardContent sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                  <Typography fontWeight={600}>{banner.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Priority {banner.priority} · {banner.active ? "Active" : "Inactive"}
                  </Typography>
                </Stack>
              </CardContent>
              <Box sx={{ p: 1.5, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => handleOpenEdit(banner)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => handleDelete(banner)}>
                  Delete
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Update banner" : "Create banner"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Title" fullWidth {...register("title", { required: true })} />
            <TextField label="Image URL" fullWidth {...register("imageUrl", { required: true })} />
            <TextField label="Link URL" fullWidth {...register("linkUrl")} />
            <TextField
              label="Priority"
              type="number"
              fullWidth
              {...register("priority", { valueAsNumber: true })}
            />
            <FormControlLabel control={<Switch defaultChecked {...register("active")} />} label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton onClick={handleSubmit(onSubmit)} variant="contained">
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

