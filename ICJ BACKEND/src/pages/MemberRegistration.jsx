import { Container } from "@mui/material";
import RegistrationForm from "../components/member-registration/RegistrationForm";

export default function MemberRegistration() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <RegistrationForm />
    </Container>
  );
}
