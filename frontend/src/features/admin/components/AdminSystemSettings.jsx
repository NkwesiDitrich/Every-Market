import React, { useEffect, useState } from "react"
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material"
import { toast } from "react-toastify"
import { fetchAdminSystemSettings, updateAdminSystemSettings } from "../AdminApi"

const FIELDS = [
  { key: "defaultCurrency", label: "Default currency", placeholder: "USD" },
  { key: "allowedCurrencies", label: "Allowed currencies (comma-separated)", placeholder: "USD,XAF,EUR" },
  { key: "taxRate", label: "Default tax rate (%)", placeholder: "0" },
  { key: "shippingFee", label: "Default shipping fee", placeholder: "0" },
  { key: "paymentGateway", label: "Payment gateway", placeholder: "flutterwave" },
  { key: "termsUrl", label: "Terms of service URL", placeholder: "https://..." },
  { key: "privacyUrl", label: "Privacy policy URL", placeholder: "https://..." },
]

export const AdminSystemSettings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminSystemSettings()
      setSettings(data || {})
    } catch (e) {
      console.error(e)
      toast.error("Error loading system settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleChange = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateAdminSystemSettings(settings)
      toast.success("System settings updated")
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error saving system settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={600}>
          System settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Default currency, tax/shipping rules, payment gateway config, and legal content URLs.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2} maxWidth={500}>
            {FIELDS.map(({ key, label, placeholder }) => (
              <TextField
                key={key}
                label={label}
                fullWidth
                value={settings[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
              />
            ))}
            <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
