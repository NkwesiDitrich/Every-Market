import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchCouponsForAdminAsync,
  selectAdminCoupons,
  selectAdminCouponsStatus,
} from "../../coupon/CouponSlice"
import { createCoupon, deleteCoupon, updateCoupon } from "../../coupon/CouponApi"
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material"
import { useForm } from "react-hook-form"
import { LoadingButton } from "@mui/lab"
import { toast } from "react-toastify"

export const AdminCoupons = () => {
  const dispatch = useDispatch()
  const coupons = useSelector(selectAdminCoupons)
  const status = useSelector(selectAdminCouponsStatus)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  useEffect(() => {
    dispatch(fetchCouponsForAdminAsync())
  }, [dispatch])

  const handleOpenCreate = () => {
    setEditing(null)
    reset({
      code: "",
      description: "",
      type: "percentage",
      value: 10,
      minOrderValue: 0,
      maxDiscount: "",
      usageLimit: "",
      active: true,
    })
    setOpen(true)
  }

  const handleOpenEdit = (coupon) => {
    setEditing(coupon)
    reset({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount || "",
      usageLimit: coupon.usageLimit ?? "",
      active: coupon.active,
    })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        value: Number(data.value),
        minOrderValue: Number(data.minOrderValue || 0),
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      }
      if (editing) {
        await updateCoupon({ ...editing, ...payload })
        toast.success("Coupon updated")
      } else {
        await createCoupon(payload)
        toast.success("Coupon created")
      }
      setOpen(false)
      dispatch(fetchCouponsForAdminAsync())
    } catch (e) {
      toast.error("Error saving coupon")
    }
  }

  const handleDelete = async (coupon) => {
    if (!window.confirm("Delete this coupon?")) return
    try {
      await deleteCoupon(coupon._id)
      toast.success("Coupon deleted")
      dispatch(fetchCouponsForAdminAsync())
    } catch (e) {
      toast.error("Error deleting coupon")
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Coupons
        </Typography>
        <Button variant="contained" onClick={handleOpenCreate}>
          Create coupon
        </Button>
      </Stack>

      {status === "pending" && <Typography color="text.secondary">Loading coupons…</Typography>}

      <Grid container spacing={2}>
        {coupons.map((coupon) => (
          <Grid key={coupon._id} item xs={12} md={6} lg={4}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography fontWeight={600}>{coupon.code}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {coupon.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {coupon.type === "percentage" ? `${coupon.value}%` : `${coupon.value} CFA`} · Min: {coupon.minOrderValue || 0} CFA
                    {coupon.maxDiscount ? ` · Max discount: ${coupon.maxDiscount} CFA` : ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Used: {coupon.usageCount ?? 0}
                    {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
                  <Button size="small" variant="outlined" onClick={() => handleOpenEdit(coupon)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(coupon)}>
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Update coupon" : "Create coupon"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Code" fullWidth {...register("code", { required: true })} />
            <TextField label="Description" fullWidth multiline rows={2} {...register("description")} />
            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                label="Type"
                defaultValue="percentage"
                onChange={(e) => setValue("type", e.target.value)}
              >
                <MenuItem value="percentage">Percentage (%)</MenuItem>
                <MenuItem value="fixed">Fixed amount</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="Value"
              fullWidth
              helperText="Percentage or fixed amount depending on type"
              {...register("value", { required: true })}
            />
            <TextField
              type="number"
              label="Minimum order value"
              fullWidth
              {...register("minOrderValue")}
            />
            <TextField
              type="number"
              label="Maximum discount (optional)"
              fullWidth
              {...register("maxDiscount")}
            />
            <TextField
              type="number"
              label="Usage limit (optional, leave empty for unlimited)"
              fullWidth
              {...register("usageLimit")}
            />
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

