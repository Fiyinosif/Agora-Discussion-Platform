// src/pages/WarningPage.tsx
import { Container, Text, Button, Center, Flex } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";

export const WarningBannedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    reason: string;
    expirationDate: Date | null;
  };

  const reason = state.reason;
  const expirationDate = state.expirationDate
    ? new Date(state.expirationDate).toLocaleDateString()
    : "never";

  return (
    <Center h="100vh" p={20}>
      <Container ta="center">
        <Text size="xl" fw={700} mb="md">
          Access Restricted
        </Text>
        <Flex c="dimmed" mb="xl" direction="column">
          <Text>You are banned from this discussion for {reason}.</Text>
          <Text>Your ban will end {expirationDate}.</Text>
        </Flex>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </Container>
    </Center>
  );
};
