// src/pages/WarningPage.tsx
import { Container, Text, Button, Center, Flex } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";

export const WarningLimitPage = () => {
  const navigate = useNavigate();

  return (
    <Center h="100vh" p={20}>
      <Container ta="center">
        <Text size="xl" fw={700} mb="md">
          Limit Reached
        </Text>
        <Flex c="dimmed" mb="xl" direction="column">
          <Text>This discussion has reached its maximum member count.</Text>
          <Text>
            You will have to have the owner change the settings to become a
            member.
          </Text>
        </Flex>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </Container>
    </Center>
  );
};
