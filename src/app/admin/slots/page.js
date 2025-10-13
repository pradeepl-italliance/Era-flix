'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  Box, Container, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Menu, MenuItem as MenuOption, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material'
import { Add, MoreVert, Edit, Delete, ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function SlotsPage() {
  const router = useRouter()
  const [slots, setSlots] = useState([])
  const [screens, setScreens] = useState([])
  const [screenId, setScreenId] = useState('') // '' = All screens
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [form, setForm] = useState({ name: '', start: '10:00 AM', end: '12:00 PM' })

  // Find the selected screen object
  const selectedScreen = useMemo(
    () => screens.find(s => s.id === screenId) || null,
    [screens, screenId]
  )

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/screens')
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Failed to load screens')

        // Only keep screens that have a location
        const withLocation = (d.screens || []).filter(s => !!s.location)
        setScreens(withLocation)

        // Load all slots by default (no screen filter)
        await loadSlots('')
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    })()
  }, [])

  async function loadSlots(screen) {
    setLoading(true)
    try {
      const url = screen ? `/api/admin/slots?screen=${encodeURIComponent(screen)}` : '/api/admin/slots'
      const r = await fetch(url)
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to load slots')
      // Sort slots by startTime in 24-hour format to show chronologically
      const sortedSlots = (d.slots || []).sort((a,b) => a.startTime.localeCompare(b.startTime))
      setSlots(sortedSlots)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleScreenChange(id) {
    setScreenId(id)
    loadSlots(id)
  }

  function openNew() {
    setIsEdit(false)
    setForm({ name: '', start: '10:00 AM', end: '12:00 PM' })
    setDialogOpen(true)
    setSelectedSlot(null)
  }

  function openEdit(slot) {
    setIsEdit(true)
    setSelectedSlot(slot)
    // Ensure dialog screen reflects the slot’s screen; if slot.screen missing, keep current selection
    setScreenId(slot.screen || screenId)
    setForm({
      name: slot.name,
      start: format12Hour(slot.startTime),
      end: format12Hour(slot.endTime),
    })
    setDialogOpen(true)
    closeMenu()
  }

  // 12-hour validation
  function isValidHHMM(s) {
    return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(s)
  }

  // Convert 12-hour input to 24-hour string
  function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12
    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`
  }

  // Convert 24-hour string to 12-hour format
  function format12Hour(time24) {
    let [hours, minutes] = time24.split(':').map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes.toString().padStart(2,'0')} ${suffix}`
  }

  async function save() {
    // Require screen for create/edit
    if (!screenId) { setError('Select a screen'); return }
    if (!form.name) { setError('Name required'); return }
    if (!isValidHHMM(form.start) || !isValidHHMM(form.end)) {
      setError('Times must be HH:MM AM/PM'); return
    }
    const body = { 
      screen: screenId, 
      name: form.name.trim(), 
      startTime: convertTo24Hour(form.start), 
      endTime: convertTo24Hour(form.end) 
    }
    try {
      let url = '/api/admin/slots'
      let method = 'POST'
      if (isEdit) {
        if (!selectedSlot?.id) { setError('No slot selected for editing'); return }
        url = `/api/admin/slots/${selectedSlot.id}`
        method = 'PUT'
      }
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Request failed')
      setSuccess(isEdit ? 'Updated' : 'Created')
      setDialogOpen(false)
      setSelectedSlot(null)
      loadSlots(screenId)
    } catch (e) { setError(e.message) }
  }

  async function del(slot) {
    if (!slot?.id) { setError('No slot selected for deletion'); return }
    if (!confirm('Delete slot?')) return
    try {
      const r = await fetch(`/api/admin/slots/${slot.id}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Delete failed')
      setSuccess('Deleted')
      setSelectedSlot(null)
      loadSlots(screenId)
    } catch (e) { setError(e.message) }
    closeMenu()
  }

  const closeMenu = () => { setAnchorEl(null) }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  )

  function screenLabel(s) {
    const loc = s.location
    const parts = []
    if (loc?.name) parts.push(loc.name)
    if (loc?.address?.city) parts.push(loc.address.city)
    const locText = parts.join(', ')
    return locText ? `${s.name} — ${locText}` : s.name
  }

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 1 }}>
        <IconButton onClick={() => router.back()}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight="bold">Time Slots</Typography>

        {selectedScreen?.location && (
          <Chip
            size="small"
            sx={{ ml: 1 }}
            label={`${selectedScreen.location.name}${selectedScreen.location.address?.city ? `, ${selectedScreen.location.address.city}` : ''}`}
          />
        )}

        <FormControl size="small" sx={{ minWidth: 260, ml: 2 }}>
          <InputLabel id="screen-label">Screen</InputLabel>
          <Select
            labelId="screen-label"
            label="Screen"
            value={screenId}
            onChange={(e) => handleScreenChange(e.target.value)}
          >
            <MenuItem value="">All screens</MenuItem>
            {screens.map(s => (
              <MenuItem key={s.id} value={s.id}>{screenLabel(s)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<Add />} onClick={openNew}>
          Add Slot
        </Button>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.map(slot => (
                <TableRow key={slot.id} hover>
                  <TableCell>{slot.name}</TableCell>
                  <TableCell>{format12Hour(slot.startTime)}</TableCell>
                  <TableCell>{format12Hour(slot.endTime)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={e => {
                        setAnchorEl(e.currentTarget)
                        setSelectedSlot(slot)
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedSlot?.id === slot.id}
                      onClose={closeMenu}
                      onClick={closeMenu}
                    >
                      <MenuOption onClick={() => openEdit(slot)}>
                        <Edit sx={{ mr: 2 }} />Edit
                      </MenuOption>
                      <MenuOption onClick={() => del(slot)} sx={{ color: 'error.main' }}>
                        <Delete sx={{ mr: 2 }} />Delete
                      </MenuOption>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{isEdit ? 'Edit' : 'New'} Slot</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="dialog-screen-label">Screen</InputLabel>
            <Select
              labelId="dialog-screen-label"
              label="Screen"
              value={screenId}
              onChange={(e) => setScreenId(e.target.value)}
            >
              {screens.map(s => (
                <MenuItem key={s.id} value={s.id}>{screenLabel(s)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Name"
            fullWidth
            margin="normal"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Start (HH:MM AM/PM)"
            fullWidth
            margin="normal"
            value={form.start}
            onChange={e => setForm({ ...form, start: e.target.value })}
          />
          <TextField
            label="End (HH:MM AM/PM)"
            fullWidth
            margin="normal"
            value={form.end}
            onChange={e => setForm({ ...form, end: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>{isEdit ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
