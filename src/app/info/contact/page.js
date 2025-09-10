'use client'
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Fade,
  Card, CardContent, CardMedia, Divider
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 👉 Import your fixed images
import banashankariImg from '../../../assets/location.png';
import basaveshwaraImg from '../../../assets/location1.png';
import goregaonImg from '../../../assets/location2.png';
import kalyanNagarImg from '../../../assets/location1.png';
import koramangalaImg from '../../../assets/location.png';
import contactImage from '../../../assets/contactbg.PNG'; // right-side image

export default function LocationsSection() {
  /* --- DATA ------------------------------------------------------------ */
  const locations = [
    { id:1, name:'Banashankari', addr:'No.3804, 13th Cross, Banashankari 2nd Stage, Bengaluru 560070',
      phone:'9964312117', email:'Eraflix1@gmail.com', img: banashankariImg },
    { id:2, name:'Basaveshwara Nagara', addr:'33 / 60 Ft Rd, 4th Block, Basaveshwara Nagar, Bengaluru 560079',
      phone:'9964312117', email:'Eraflix1@gmail.com', img: basaveshwaraImg },
    { id:3, name:'Goregaon West', addr:'Harmony Mall, Shop 14, New Link Rd, Mumbai 400104',
      phone:'9964312117', email:'Eraflix1@gmail.com', img: goregaonImg },
    { id:4, name:'Kalyan Nagar', addr:'49-50, 3rd Cross Rd, Kalyan Nagar, Bengaluru 560043',
      phone:'9964312117', email:'Eraflix1@gmail.com', img: kalyanNagarImg },
    { id:5, name:'Koramangala', addr:'475, 1st Cross Rd, 5th Block, Koramangala, Bengaluru 560095',
      phone:'9964312117', email:'Eraflix1@gmail.com', img: koramangalaImg }
  ];

  /* --- CAROUSEL STATE -------------------------------------------------- */
  const [page, setPage] = useState(0);
  const [fade, setFade] = useState(true);

  const perPage = 3; // Number of cards visible at a time
  const pageCount = Math.ceil(locations.length / perPage);

  const visible = useMemo(() => {
    const start = page * perPage;
    return locations.slice(start, start + perPage);
  }, [page, perPage]);

  const step = (dir) => {
    setFade(false);
    setTimeout(() => {
      setPage(p => (p + (dir === 'next' ? 1 : -1) + pageCount) % pageCount);
      setFade(true);
    }, 150);
  };

  /* --- FORM STATES ---------------------------------------------------- */
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [source, setSource] = useState("");

  const validateName = (value) => {
    const regex = /^(?!.*[.]{2,})(?!.*\s{2,})[A-Za-z .]+$/;
    setNameError(regex.test(value) ? "" : "Name should contain only letters, spaces, and periods");
  };
  const validatePhone = (value) => {
    if (!/^\d*$/.test(value)) setPhoneError("Only numbers are allowed");
    else if (value.length !== 10) setPhoneError("Phone number must be exactly 10 digits");
    else if (!/^[6-9]/.test(value)) setPhoneError("Invalid number");
    else setPhoneError("");
  };
  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(regex.test(value) ? "" : "Enter valid email address");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nameError || phoneError || emailError || !name || !phone || !email) {
      alert("Please fix errors before submitting");
      return;
    }
    alert(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSource: ${source}`);
    setName(""); setPhone(""); setEmail(""); setSource(""); setNameError(""); setPhoneError(""); setEmailError("");
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": { backgroundColor:"#000", "& fieldset":{borderColor:"#fff"},"&:hover fieldset":{borderColor:"#fff"},"&.Mui-focused fieldset":{borderColor:"#fff"} },
    "& .MuiInputBase-input": { color:"#fff" },
    "& .MuiFormLabel-root": { color:"#fff" }
  };

  return (
    <Box sx={{ py:{xs:4,md:8}, px:{xs:1,sm:2,md:4}, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      
      {/* Contact Section */}
      <Box sx={{ width:"100%", minHeight:"500px", display:"flex", flexDirection:{xs:"column",md:"row"}, borderRadius:2, overflow:"hidden", boxShadow:3, mb:3 }}>
        
        {/* Left Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ flex:1, backgroundColor:"#000", p:{xs:4,md:6}, display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <Typography variant="h4" mb={2} sx={{ fontSize:{xs:"2rem",md:"3rem",lg:"48px"}, fontStyle:"italic", fontFamily:'"Cormorant", serif', fontWeight:400, color:"#fff" }}>
            Get in <Box component="span" color="red">Touch</Box>
          </Typography>
          <Typography variant="body1" mb={4} sx={{ color:"#fff" }}>
            {"We'd love to hear from you! Reach out to us with your questions, ideas, or feedback — we're just a message away."}
          </Typography>
          <TextField label="Name" variant="outlined" fullWidth value={name} onChange={(e)=>{const val=e.target.value.replace(/[^A-Za-z .]/g,""); setName(val); validateName(val)}} error={!!nameError} helperText={nameError} sx={{mb:2,...inputStyle}} FormHelperTextProps={{style:{color:"red"}}}/>
          <TextField label="Email" variant="outlined" fullWidth value={email} onChange={(e)=>{setEmail(e.target.value); validateEmail(e.target.value)}} error={!!emailError} helperText={emailError} sx={{mb:2,...inputStyle}} FormHelperTextProps={{style:{color:"red"}}}/>
          <TextField label="Phone Number" variant="outlined" fullWidth value={phone} onChange={(e)=>{setPhone(e.target.value); validatePhone(e.target.value)}} error={!!phoneError} helperText={phoneError} sx={{mb:2,...inputStyle}} FormHelperTextProps={{style:{color:"red"}}} inputProps={{maxLength:10}}/>
          <TextField label="How did you hear about us?" variant="outlined" select fullWidth value={source} onChange={(e)=>setSource(e.target.value)} sx={{mb:2,...inputStyle}}>
            <MenuItem value="google" sx={{color:"black"}}>Google</MenuItem>
            <MenuItem value="social" sx={{color:"black"}}>Social Media</MenuItem>
            <MenuItem value="friend" sx={{color:"black"}}>Friend</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="error" sx={{ mt:1 }}>SEND</Button>
          <Box sx={{ display:"flex", gap:3, mt:4 }}>
            <Box sx={{ display:"flex", alignItems:"center", gap:1 }}><Box component="span">📞</Box><Typography variant="body2" sx={{color:"#fff"}}>+91 9964312117</Typography></Box>
            <Box sx={{ display:"flex", alignItems:"center", gap:1 }}><Box component="span">✉️</Box><Typography variant="body2" sx={{color:"#fff"}}>Eraflix1@gmail.com</Typography></Box>
          </Box>
        </Box>

        {/* Right-side fixed image */}
        <Box sx={{ flex:1, position:"relative", display:"flex", justifyContent:"center", alignItems:"center", backgroundColor:"#f5f5f5" }}>
          <img src={contactImage.src} alt="Contact" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        </Box>
      </Box>

      {/* Carousel with arrows */}
      <Box sx={{ width:"100%", position:"relative", mt:6 }}>
        <Fade in={fade} timeout={400}>
          <Box sx={{ display:"flex", gap:2, justifyContent:"center" }}>
            {visible.map(loc => (
              <Card key={loc.id} sx={{ maxWidth:345, flex:1 }}>
                <CardMedia component="img" height="140" image={loc.img.src} alt={loc.name} />
                <CardContent>
                  <Typography gutterBottom variant="h6">{loc.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{loc.addr}</Typography>
                  <Divider sx={{ my:1 }} />
                  <Typography variant="body2">📞 {loc.phone}</Typography>
                  <Typography variant="body2">✉️ {loc.email}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Fade>

        {/* Arrows */}
        <Box sx={{ position:"absolute", top:"50%", left:0, transform:"translateY(-50%)" }}>
          <Button onClick={()=>step('prev')}><ChevronLeft /></Button>
        </Box>
        <Box sx={{ position:"absolute", top:"50%", right:0, transform:"translateY(-50%)" }}>
          <Button onClick={()=>step('next')}><ChevronRight /></Button>
        </Box>
      </Box>
    </Box>
  );
}
