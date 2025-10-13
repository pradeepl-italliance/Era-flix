"use client";

import { useState } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Collapse, 
  IconButton, 
  Divider 
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PolicyIcon from "@mui/icons-material/Policy";

const sections = [
  {
    title: "1. Services & Booking",
    content: [
      "EraFlix offers private mini-theatre / screening room services where users may visit, use their own content / streaming credentials or cast from devices, subject to booking rules and guidelines.",
      "To secure a time slot, you may be required to pay an advance (deposit) or full payment. The advance is refundable (less a 10% convenience fee) only if cancellation is made at least 72 hours in advance. Cancellations within 72 hours are generally non-refundable, except at our discretion.",
      "Individuals under 18 years may not book a private theatre slot alone; they must be part of a group. Couples under 18 are not permitted unless booked as part of a larger group."
    ]
  },
  {
    title: "2. Use During Visit / On-site Rules",
    content: [
      "You and at least one accompanying person must present valid government-issued ID at the time of your visit.",
      "We do not provide any movie, OTT, streaming, or login accounts. You must use your own credentials or cast from your own device. Sharing or using pirated / unauthorized content is strictly prohibited.",
      "Smoking, drinking alcoholic beverages, or drug use is strictly prohibited inside the facility. Party poppers, snow sprays, confetti, firework-type items, cold fire, or similar pyrotechnic devices are prohibited. You must not damage property, décor, equipment, lighting, or any facility. You must keep the space reasonably clean and return it in the condition you found it.",
      "If any damage or loss is caused during your occupancy, you will be responsible for the cost of repair / replacement."
    ]
  },
  {
    title: "3. Payment & Refunds",
    content: [
      "We accept payment methods as displayed at checkout (credit card, debit card, UPI, etc.). You agree to pay all amounts due as per the booking.",
      "Refunds (where applicable) will be credited back to the original method of payment, minus any fees (e.g. 10% convenience fee). Processing may take 5-7 days depending on banking / payment processors."
    ]
  },
  {
    title: "4. Cancellations & Rescheduling",
    content: [
      "You may cancel as described in Section 1.2 above. Rescheduling is subject to availability; we may treat it as a cancellation + new booking depending on timing.",
      "We reserve the right to cancel or reschedule bookings (e.g., maintenance, emergency, force majeure). In such cases, we will attempt to notify you in advance and issue a full refund or offer an alternate slot."
    ]
  },
  {
    title: "5. Intellectual Property",
    content: [
      "All content on this site (text, graphics, logos, images, designs, software) is our property or licensed to us, and is protected by copyright, trademark, and other intellectual property laws.",
      "You are granted a limited, non-exclusive, non-transferable license to use the site and Services for personal, non-commercial use only."
    ]
  },
  {
    title: "6. Disclaimers & Limitation of Liability",
    content: [
      "The services and site are provided “as is” without warranties of any kind.",
      "We shall not be liable for any indirect, incidental, or consequential damages. Total liability is limited to the total amount you paid in the six months preceding a claim."
    ]
  },
  {
    title: "7. Privacy & Personal Data",
    content: [
      "Your use of personal data is governed by our Privacy Policy, incorporated into these Terms by reference."
    ]
  },
  {
    title: "8. Termination",
    content: [
      "We may suspend or terminate your access if you breach these Terms. Provisions like liability, IP, and indemnification survive termination."
    ]
  },
  {
    title: "9. Governing Law & Dispute Resolution",
    content: [
      "These Terms are governed by the laws of India . Disputes are subject to the exclusive jurisdiction of courts located in Bangalore, Karnataka."
    ]
  },
  {
    title: "10. General Provisions",
    content: [
      "We may amend these Terms and post the revised version. Severability, waiver, and the entire agreement clauses apply as described above."
    ]
  }
];

export default function TermsPage() {
  // First section expanded by default
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 6, px: 2, background: "#f5f5f5" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem', lg:'4rem' },
              fontWeight: 700,
              fontFamily: '"Cormorant", serif',
              background: 'linear-gradient(45deg, #ff4d00, #D50A17)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Terms & Conditions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
           {` Please read carefully the rules, guidelines, and policies.`}
          </Typography>
        </Box>

        {/* Accordion Paper */}
        <Paper 
          elevation={4}
          sx={{ borderRadius: 3, p: { xs: 3, md: 5 }, overflowY: 'auto', background: "#fff" }}
        >
          {sections.map((section, index) => (
            <Box key={index} mb={3}>
              <Box 
                sx={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  cursor: 'pointer', 
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  background: "#f9f9f9",
                  '&:hover': { background: "#f0f0f0" }
                }}
                onClick={() => toggleExpand(index)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PolicyIcon sx={{ color: '#D50A17' }} />
                  <Typography variant="h6" fontWeight="bold">{section.title}</Typography>
                </Box>
                <IconButton>
                  <ExpandMoreIcon 
                    sx={{
                      transform: expandedIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }}
                  />
                </IconButton>
              </Box>
              <Collapse in={expandedIndex === index}>
                <Box sx={{ mt: 1.5, pl: 6 }}>
                  {section.content.map((line, idx) => (
                    <Typography variant="body1" key={idx} sx={{ mb: 1.2, lineHeight: 1.7 }}>
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Collapse>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}
