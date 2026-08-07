import { Box, Container } from "@mui/material";
import RegistrationForm from "../components/member-registration/RegistrationForm";

export default function Register() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: "linear-gradient(145deg,#f8f9ff,#edf7f7)",
      }}
    >
      <Container maxWidth="lg">
        <RegistrationForm />
      </Container>
    </Box>
  );
}