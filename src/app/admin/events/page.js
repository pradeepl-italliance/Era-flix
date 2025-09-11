'use client'
import { useState, useEffect } from 'react'
import {
  Box, Container, Typography, Button, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Menu, MenuItem as MenuOption, Alert, CircularProgress
} from '@mui/material'
import { Add, MoreVert, Edit, Delete, ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/navigation'


export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // menu & dialogs
  const [anchorEl, setAnchorEl] = useState(null)
  const [targetEvent, setTargetEvent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  // form
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    duration: 60, basePrice: 0
  })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/events')
      const data = await res.json()      
      if (!res.ok) throw new Error(data.error || 'Failed')
      setEvents(data.events)
      setUser(data.user)
      console.log("User loaded from API:", data.user) // debug
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function openNew() {
    setIsEdit(false)
    setForm({ title:'', description:'', category:'', duration:60, basePrice:0 })
    setDialogOpen(true)
  }

  function openEdit(ev) {
    setIsEdit(true)
    setTargetEvent(ev)
    setForm({
      title: ev.name,
      description: ev.description || '',
      category: ev.category || '',
      duration: ev.duration ?? 60,
      basePrice: ev?.pricing?.basePrice ?? 0
    })
    setDialogOpen(true)
    handleCloseMenu()
  }

  async function save() {
    if (!form.title || !form.category) { setError('Title & category required'); return }

    const payload = {
      name: form.title,
      description: form.description,
      category: form.category,
      duration: Number(form.duration),
      pricing: { basePrice: Number(form.basePrice) }
    }

    try {
      const isEditing = isEdit && targetEvent?.id
      const url = isEditing ? `/api/admin/events/${targetEvent.id}` : '/api/admin/events'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSuccess(isEditing ? 'Updated' : 'Created')
      setDialogOpen(false)
      setTargetEvent(null)
      load()
    } catch(e){ setError(e.message) }
  }

  // async function del() {
  //   if (!targetEvent?.id) { setError('No event selected'); return }
  //   if (!confirm('Delete event?')) return
  //   try {
  //     const res = await fetch(`/api/admin/events/${targetEvent.id}`, { method:'DELETE' })
  //     const data = await res.json()
  //     if (!res.ok) throw new Error(data.error || 'Failed')
  //     setSuccess('Deleted')
  //     setTargetEvent(null)
  //     load()
  //   } catch (e) { setError(e.message) }
  //   handleCloseMenu()
  // }
  // Add these states
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

// update del function
async function del() {
  if (!targetEvent?.id) { setError('No event selected'); return }
  try {
    const res = await fetch(`/api/admin/events/${targetEvent.id}`, { method:'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed')
    setSuccess('Deleted')
    setTargetEvent(null)
    load()
  } catch (e) { setError(e.message) }
  setDeleteDialogOpen(false) // close dialog after action
  handleCloseMenu()
}

// instead of confirm, open dialog
const handleDeleteClick = () => {
  setDeleteDialogOpen(true)
  handleCloseMenu()
}


  const handleCloseMenu = () => { setAnchorEl(null) } // keep targetEvent

  if (loading) {
    return (
      <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh'}}>
        <CircularProgress size={64}/>
      </Box>
    )
  }

  return (
    <Box sx={{bgcolor:'grey.100',minHeight:'100vh'}}>
      {/* Toolbar */}
      <Box sx={{bgcolor:'white',px:3,py:2,display:'flex',alignItems:'center',gap:2,boxShadow:1}}>
        <IconButton onClick={() => router.back()}><ArrowBack/></IconButton>
        <Typography variant="h5" fontWeight="bold">Events</Typography>
        <Box sx={{flexGrow:1}}/>
        <Button variant="contained" startIcon={<Add/>} onClick={openNew}>Add Event</Button>
      </Box>

      <Container maxWidth="lg" sx={{mt:4}}>
        {error && <Alert severity="error" sx={{mb:3}} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{mb:3}} onClose={() => setSuccess('')}>{success}</Alert>}

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Base ₹</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(ev => (
                <TableRow key={ev.id} hover>
                  <TableCell>{ev.name}</TableCell>
                  <TableCell>{ev.category}</TableCell>
                  <TableCell>{ev.duration} min</TableCell>
                  <TableCell>₹{ev?.pricing?.basePrice ?? 0}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget)
                        setTargetEvent(ev)
                      }}
                    >
                      <MoreVert/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      {/* menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
      >
        <MenuOption onClick={() => openEdit(targetEvent)}>
          <Edit sx={{mr:2}}/>Edit
        </MenuOption>
        <MenuOption onClick={handleDeleteClick} sx={{color:'error.main'}}>
  <Delete sx={{mr:2}}/>Delete
</MenuOption>

      </Menu>

      {/* dialog */}
<Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>Delete Event</DialogTitle>
  <DialogContent>
    <Typography>
      Do you really want to delete this event?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
    <Button color="error" variant="contained" onClick={del}>
      Delete
    </Button>
  </DialogActions>
</Dialog>




      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit' : 'New'} Event</DialogTitle>
        <DialogContent sx={{pt:2}}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            required
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
          />
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            required
            value={form.category}
            onChange={e => setForm({...form, category: e.target.value})}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            fullWidth
            margin="normal"
            value={form.duration}
            onChange={e => setForm({...form, duration: Number(e.target.value)})}
          />
          <TextField
            label="Base Price (₹)"
            type="number"
            fullWidth
            margin="normal"
            value={form.basePrice}
            onChange={e => setForm({...form, basePrice: Number(e.target.value)})}
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
