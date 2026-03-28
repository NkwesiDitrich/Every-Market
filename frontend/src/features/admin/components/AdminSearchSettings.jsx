import React, { useEffect, useState } from "react"
import {
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material"
import { toast } from "react-toastify"
import { axiosi } from "../../../config/axios"
import { fetchAdminSearchSettings, updateAdminSearchSettings } from "../AdminApi"

export const AdminSearchSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [defaultSort, setDefaultSort] = useState("createdAt")
  const [defaultOrder, setDefaultOrder] = useState("desc")
  const [boostBrandIds, setBoostBrandIds] = useState([])
  const [boostCategoryIds, setBoostCategoryIds] = useState([])

  const load = async () => {
    try {
      setLoading(true)
      const [data, brandsRes, categoriesRes] = await Promise.all([
        fetchAdminSearchSettings(),
        axiosi.get("/brands").then((r) => r.data),
        axiosi.get("/categories").then((r) => r.data),
      ])
      setSettings(data)
      setBrands(brandsRes || [])
      setCategories(categoriesRes || [])
      setDefaultSort(data.defaultSort || "createdAt")
      setDefaultOrder(data.defaultOrder || "desc")
      setBoostBrandIds((data.boostBrandIds || []).map((b) => (typeof b === "object" ? b._id : b)))
      setBoostCategoryIds((data.boostCategoryIds || []).map((c) => (typeof c === "object" ? c._id : c)))
    } catch (e) {
      console.error(e)
      toast.error("Error loading search settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateAdminSearchSettings({ defaultSort, defaultOrder, boostBrandIds, boostCategoryIds })
      toast.success("Search settings updated")
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error saving search settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading && !settings) return <Typography>Loading…</Typography>

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={600}>Search settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Default sort order and boost certain brands or categories in search results.
        </Typography>
      </Stack>
      <Card>
        <CardContent>
          <Stack spacing={3} maxWidth={500}>
            <FormControl fullWidth>
              <InputLabel>Default sort field</InputLabel>
              <Select label="Default sort field" value={defaultSort} onChange={(e) => setDefaultSort(e.target.value)}>
                <MenuItem value="createdAt">Created date</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="price">Price</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Default order</InputLabel>
              <Select label="Default order" value={defaultOrder} onChange={(e) => setDefaultOrder(e.target.value)}>
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Boost brands (higher visibility in search)</InputLabel>
              <Select
                multiple
                value={boostBrandIds}
                onChange={(e) => setBoostBrandIds(e.target.value)}
                input={<OutlinedInput label="Boost brands (higher visibility in search)" />}
                renderValue={(selected) => (
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {selected.map((id) => {
                      const b = brands.find((x) => (x._id || x.id) === id)
                      return <Chip key={id} size="small" label={b?.name || id} />
                    })}
                  </Stack>
                )}
              >
                {brands.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Boost categories (higher visibility in search)</InputLabel>
              <Select
                multiple
                value={boostCategoryIds}
                onChange={(e) => setBoostCategoryIds(e.target.value)}
                input={<OutlinedInput label="Boost categories (higher visibility in search)" />}
                renderValue={(selected) => (
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {selected.map((id) => {
                      const c = categories.find((x) => (x._id || x.id) === id)
                      return <Chip key={id} size="small" label={c?.name || id} />
                    })}
                  </Stack>
                )}
              >
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
