// src/pages/WarningPage.tsx
import { Container, Text, Button, Center } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export const WarningPage = () => {
  const navigate = useNavigate();

  return (
    <Center h="100vh" p={20}>
      <Container ta="center">
        <Text size="xl" fw={700} mb="md">
          Access Restricted
        </Text>
        <Text c="dimmed" mb="xl">
          This discussion is private. You don't have permission to view it.
        </Text>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </Container>
    </Center>
  );
};
