import { Container, Text, Button, Center, Flex } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { useUser } from "../../authentication/use-auth";
import { ApiResponse, InviteGetDto } from "../../constants/types";

export const WarningInvitePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();

  const state = location.state as { discussionId: number; ownerId: number };
  const discussionId = state!.discussionId;
  const ownerId = state!.ownerId;

  const handleRequestInvite = async () => {
    if (!user?.id || !discussionId || !ownerId) return;

    try {
      const res = await api.post<ApiResponse<InviteGetDto>>("/api/invites", {
        discussionId,
        senderUserId: user.id,
        recipientUserId: ownerId,
        message: `${user.userName} would like to join this discussion.`,
        status: "Pending",
      });

      if (res.data.hasErrors) {
        const errorMsg = res.data.errors.map((e) => e.message).join("\n");
        showNotification({
          message: errorMsg || "Failed to send request.",
          color: "red",
        });
        return;
      }

      showNotification({
        message: `Request sent to the discussion owner.`,
        color: "green",
      });

      navigate("/");
    } catch (e) {
      showNotification({
        message: "Unexpected error sending request.",
        color: "red",
      });
    }
  };

  return (
    <Flex h={"50vh"} align="center" justify="center">
      <Container ta="center">
        <Text size="xl" fw={700} mb="md">
          Access Restricted
        </Text>
        <Text c="dimmed" mb="xl">
          This Discussion requires you to be invited first
        </Text>
        <Flex justify="space-between">
          <Button onClick={handleRequestInvite}>Request Invite</Button>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </Flex>
      </Container>
    </Flex>
  );
};
