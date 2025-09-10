'use client'
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  useTheme, useMediaQuery, Fade, Card, CardContent, CardMedia, Divider, Skeleton, Alert,
  Snackbar
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LocationsCarousel() {
  /* --- BREAKPOINT-DRIVEN "perPage" ------------------------------------ */
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const perPage = lgUp ? 3 : mdUp ? 2 : 1;

  /* --- DATA (fetched) -------------------------------------------------- */
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapToUi = (l) => {
    const addrParts = [
      l?.address?.street,
      l?.address?.area,
      l?.address?.city,
      l?.address?.state,
      l?.address?.pincode,
    ].filter(Boolean);
    const addr = addrParts.join(', ');
    const img =
      l?.images?.find(i => i.isPrimary)?.url ||
      (l?.images && l.images?.url) ||
      'https://picsum.photos/400/250?random=10';
    const city = l?.address?.city || '';
    return {
      id: l.id,
      name: l.name,
      addr,
      phone: l?.contactInfo?.phone || '',
      email: l?.contactInfo?.email || '',
      img,
      city,
    };
  };

  useEffect(() => {
    const controller = new AbortController();
    async function fetchLocations() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch('/api/public/locations', { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (data?.success && Array.isArray(data.locations)) {
          const ui = data.locations.map(mapToUi);
          setLocations(ui);
        } else {
          throw new Error('Malformed response');
        }
      } catch (e) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Failed to fetch locations');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
    return () => controller.abort();
  }, []);

  /* --- CAROUSEL STATE -------------------------------------------------- */
  const pageCount = Math.max(1, Math.ceil((locations.length || 0) / perPage));
  const [page, setPage] = useState(0);
  const [fade, setFade] = useState(true);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || loading || !locations.length) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPage(p => (p + 1) % pageCount);
        setFade(true);
      }, 200);
    }, 5000);
    return () => clearInterval(t);
  }, [auto, pageCount, loading, locations.length]);

  const visible = useMemo(() => {
    if (!locations.length) return [];
    const start = page * perPage;
    return locations.slice(start, start + perPage);
  }, [page, perPage, locations]);

  const step = (dir) => {
    setAuto(false);
    setFade(false);
    setTimeout(() => {
      setPage(p => (p + (dir === 'next' ? 1 : -1) + pageCount) % pageCount);
      setFade(true);
    }, 150);
    setTimeout(() => setAuto(true), 8000);
  };

  /* --- FORM STATES ---------------------------------------------------- */
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [source, setSource] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  // Validations
  const validateName = (value) => {
    const regex = /^(?!.*[.]{2,})(?!.*\s{2,})[A-Za-z .]+$/;
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    } else if (!regex.test(value)) {
      setNameError("Name should contain only letters, spaces, and periods");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

  const validatePhone = (value) => {
    if (!/^\d*$/.test(value)) {
      setPhoneError("Only numbers are allowed");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(value)) {
      setPhoneError("Phone must start with 6-9 and be 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!regex.test(value)) {
      setEmailError("Enter valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    
    if (!isNameValid || !isEmailValid || !isPhoneValid || !name || !phone || !email) {
      setSubmitStatus({
        open: true,
        message: 'Please fix errors before submitting',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, source: source || 'unknown' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setSubmitStatus({
        open: true,
        message: data.message || 'Thank you for contacting us! We will get back to you soon.',
        severity: 'success'
      });

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setSource("");
      setPhoneError("");
      setNameError("");
      setEmailError("");

    } catch (error) {
      setSubmitStatus({
        open: true,
        message: error.message || 'Failed to submit form. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitStatus({ ...submitStatus, open: false });
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#000",
      "& fieldset": { borderColor: "#fff" },
      "&:hover fieldset": { borderColor: "#fff" },
      "&.Mui-focused fieldset": { borderColor: "#fff" },
    },
    "& .MuiInputBase-input": { color: "#fff" },
    "& .MuiFormLabel-root": { color: "#fff" }
  };

  return (
    <Box sx={{
      py: { xs: 4, md: 8 },
      px: { xs: 1, sm: 2, md: 4 },
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Contact Section with Form + Map */}
      <Box
        component="section"
        sx={{
          width: "100%",
          minHeight: "500px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          marginBottom: '30px'
        }}
      >
        {/* Left side: form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            backgroundColor: "#000",
            p: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            mb={2}
            sx={{
              fontSize: { xs: "2rem", md: "3rem", lg: "48px" },
              fontStyle: "italic",
              fontFamily: '"Cormorant", serif',
              fontWeight: 400,
              color: "#fff",
            }}
          >
            Get in <Box component="span" color="red">Touch</Box>
          </Typography>

          <Typography variant="body1" mb={4} sx={{ color: "#fff" }}>
            {"We'd love to hear from you! Reach out to us with your questions, ideas, or feedback — we're just a message away."}
          </Typography>

          {/* Name */}
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => {
              const val = e.target.value.replace(/[^A-Za-z .]/g, "");
              setName(val);
              validateName(val);
            }}
            error={!!nameError}
            helperText={nameError}
            sx={{ mb: 2, ...inputStyle }}
            FormHelperTextProps={{ style: { color: "red" } }}
            required
          />

          {/* Email */}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            error={!!emailError}
            helperText={emailError}
            sx={{ mb: 2, ...inputStyle }}
            FormHelperTextProps={{ style: { color: "red" } }}
            required
          />

          {/* Phone */}
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            value={phone}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhone(next);
              validatePhone(next);
            }}
            error={!!phoneError}
            helperText={phoneError}
            sx={{ mb: 2, ...inputStyle }}
            FormHelperTextProps={{ style: { color: "red" } }}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }}
            required
          />

          {/* Dropdown */}
          <TextField
            label="How did you hear about us?"
            variant="outlined"
            select
            fullWidth
            value={source}
            onChange={(e) => setSource(e.target.value)}
            sx={{ mb: 2, ...inputStyle }}
          >
            <MenuItem value="">Select an option</MenuItem>
            <MenuItem value="google">Google</MenuItem>
            <MenuItem value="social">Social Media</MenuItem>
            <MenuItem value="friend">Friend</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <Button 
            type="submit" 
            variant="contained" 
            color="error" 
            sx={{ mt: 1 }}
            disabled={submitting}
          >
            {submitting ? 'SENDING...' : 'SEND'}
          </Button>

          {/* Contact info */}
          <Box sx={{ display: "flex", gap: 3, mt: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span">📞</Box>
              <Typography variant="body2" sx={{ color: "#fff" }}>+91 9964312117</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span">✉️</Box>
              <Typography variant="body2" sx={{ color: "#fff" }}>Eraflix1@gmail.com</Typography>
            </Box>
          </Box>
        </Box>

        {/* Right side: map */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "red",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: { xs: '300px', md: 'auto' }
          }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.1010811164917!2d77.58843777526106!3d12.978375990865033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670b0f0a0e9%3A0x6e3e5f3c26c128b4!2sBengaluru!5e0!3m2!1sen!2sin!4v1692874700000!5m2!1sen!2sin"
            width="80%"
            height="80%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Box>
      </Box>

      {/* Error / Retry */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      )}

      {/* Carousel */}
      <Box sx={{ width: "100%", position: "relative", minHeight: 260, mb: 4 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
          Our Locations
        </Typography>
        
        <Fade in={fade} timeout={400}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: 'wrap' }}>
            {loading ? (
              Array.from({ length: perPage }).map((_, i) => (
                <Card key={`s-${i}`} sx={{ maxWidth: 345, flex: 1, minWidth: 280, p: 2 }}>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton width="60%" />
                    <Skeleton width="90%" />
                    <Divider sx={{ my: 1 }} />
                    <Skeleton width="40%" />
                    <Skeleton width="50%" />
                  </CardContent>
                </Card>
              ))
            ) : (
              visible.map(loc => (
                <Card key={loc.id} sx={{ maxWidth: 345, flex: 1, minWidth: 280 }}>
                  <CardMedia 
                    component="img" 
                    height="140" 
                    image={loc.img} 
                    alt={loc.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {loc.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {loc.addr}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      📞 {loc.phone}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      ✉️ {loc.email}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Fade>

        {/* Navigation buttons */}
        {!loading && locations.length > 0 && (
          <>
            <Box sx={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)" }}>
              <Button onClick={() => step('prev')} aria-label="Previous" disabled={page === 0}>
                <ChevronLeft />
              </Button>
            </Box>
            <Box sx={{ position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)" }}>
              <Button onClick={() => step('next')} aria-label="Next" disabled={page === pageCount - 1}>
                <ChevronRight />
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={submitStatus.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={submitStatus.severity}
          sx={{ width: '100%' }}
        >
          {submitStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}