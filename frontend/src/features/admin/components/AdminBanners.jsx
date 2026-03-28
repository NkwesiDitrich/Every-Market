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
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const { register, handleSubmit, reset, setValue, watch } = useForm()
  const currentImageUrl = watch("imageUrl")

  useEffect(() => {
    dispatch(fetchBannersForAdminAsync())
  }, [dispatch])

  const handleOpenCreate = () => {
    setEditing(null)
    setSelectedFile(null)
    setPreviewUrl(null)
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
    setSelectedFile(null)
    setPreviewUrl(null)
    reset({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      priority: banner.priority ?? 0,
      active: banner.active,
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("linkUrl", data.linkUrl || "")
      formData.append("priority", data.priority || 0)
      formData.append("active", data.active)

      if (selectedFile) {
        formData.append("image", selectedFile)
      } else if (editing) {
        formData.append("imageUrl", data.imageUrl)
      }

      if (editing) {
        formData.append("_id", editing._id)
        await updateBanner(formData)
        toast.success("Banner updated")
      } else {
        if (!selectedFile) {
            toast.error("Please upload an image")
            return
        }
        await createBanner(formData)
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
                  position: 'relative'
                }}
              >
                {!banner.active && (
                   <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'error.main', color: '#fff', px: 1, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700 }}>
                    INACTIVE
                   </Box>
                )}
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
                    Priority {banner.priority} · {banner.linkUrl ? "Linked" : "No Link"}
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
            <TextField label="Title" placeholder="e.g. Summer Collection" fullWidth {...register("title", { required: true })} />
            
            <Box>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">Banner Image</Typography>
                <Box 
                    sx={{ 
                        width: '100%', 
                        height: 180, 
                        border: '2px dashed #E0E0E0', 
                        borderRadius: 2, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        bgcolor: 'background.default'
                    }}
                >
                    {(previewUrl || currentImageUrl) ? (
                        <>
                            <img 
                                src={previewUrl || currentImageUrl} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                alt="Preview" 
                            />
                            <Button 
                                component="label" 
                                variant="contained" 
                                size="small"
                                sx={{ position: 'absolute', bottom: 10, right: 10 }}
                            >
                                Change Image
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </Button>
                        </>
                    ) : (
                        <Stack spacing={1} alignItems="center">
                            <Typography variant="body2" color="text.secondary">No image selected</Typography>
                            <Button component="label" variant="outlined" size="small">
                                Upload Image
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Box>

            <TextField label="Link URL" placeholder="e.g. /products/shoes" fullWidth {...register("linkUrl")} />
            <TextField
              label="Priority"
              type="number"
              placeholder="Higher = shows first"
              fullWidth
              {...register("priority", { valueAsNumber: true })}
            />
            <FormControlLabel control={<Switch defaultChecked {...register("active")} />} label="Active Status" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton onClick={handleSubmit(onSubmit)} variant="contained">
            {editing ? "Update Banner" : "Create Banner"}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

