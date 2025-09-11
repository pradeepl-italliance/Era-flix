'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  MoreVert,
  ArrowBack,
  Refresh,
  Visibility
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function ContactSubmissionsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuContact, setMenuContact] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/contacts')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to load contact submissions')
      }

      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
    
    return matchesStatus && matchesSearch
  })

  function handleMenuClick(event, contact) {
    setAnchorEl(event.currentTarget)
    setMenuContact(contact)
  }

  function handleMenuClose() {
    setAnchorEl(null)
    setMenuContact(null)
  }

  function viewContactDetails(contact) {
    setSelectedContact(contact)
    setDetailDialogOpen(true)
    handleMenuClose()
  }

  async function updateContactStatus(status) {
    try {
      const response = await fetch(`/api/admin/contacts/${menuContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update contact status')

      // Refresh the data
      loadData()
      setError('')
    } catch (error) {
      setError(error.message)
    }
    handleMenuClose()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', boxShadow: 1, px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Contact Submissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage customer inquiries and contact requests
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={loadData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search by name, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            size="small"
          />
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="spam">Spam</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Summary Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total: ${contacts.length}`} 
            color="default" 
            variant="outlined" 
          />
          <Chip 
            label={`New: ${contacts.filter(c => c.status === 'new').length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Contacted: ${contacts.filter(c => c.status === 'contacted').length}`} 
            color="warning" 
            variant="outlined" 
          />
          <Chip 
            label={`Completed: ${contacts.filter(c => c.status === 'completed').length}`} 
            color="success" 
            variant="outlined" 
          />
        </Box>

        {/* Contacts Table */}
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {contacts.length === 0 ? 'No contact submissions yet' : 'No matching submissions found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {contact.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          📞 {contact.phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ✉️ {contact.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={contact.source || 'unknown'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={contact.status}
                          color={
                            contact.status === 'new' ? 'primary' :
                            contact.status === 'contacted' ? 'warning' :
                            contact.status === 'completed' ? 'success' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(contact.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={(e) => handleMenuClick(e, contact)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => viewContactDetails(menuContact)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => updateContactStatus('new')}>
          Mark as New
        </MenuItem>
        <MenuItem onClick={() => updateContactStatus('contacted')}>
          Mark as Contacted
        </MenuItem>
        <MenuItem onClick={() => updateContactStatus('completed')}>
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => updateContactStatus('spam')}>
          Mark as Spam
        </MenuItem>
      </Menu>

      {/* Contact Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Contact Submission Details</DialogTitle>
        <DialogContent>
          {selectedContact && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{selectedContact.name}</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Contact Information</Typography>
                <Typography>📞 {selectedContact.phone}</Typography>
                <Typography>✉️ {selectedContact.email}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Source</Typography>
                <Chip 
                  label={selectedContact.source || 'unknown'} 
                  size="small" 
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={selectedContact.status}
                  color={
                    selectedContact.status === 'new' ? 'primary' :
                    selectedContact.status === 'contacted' ? 'warning' :
                    selectedContact.status === 'completed' ? 'success' : 'default'
                  }
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Submitted On</Typography>
                <Typography>
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {selectedContact.updatedAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                  <Typography>
                    {new Date(selectedContact.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}