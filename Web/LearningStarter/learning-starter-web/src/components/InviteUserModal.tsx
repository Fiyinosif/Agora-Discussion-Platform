import { useState } from "react";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../config/axios";
import { ApiResponse, UserDto } from "../constants/types";
import { useUser } from "../authentication/use-auth";

type InviteUserModalProps = {
  opened: boolean;
  onClose: () => void;
  discussionId: number;
  senderUserId: number;
};

type InviteCreateDto = {
  discussionId: number;
  senderUserId: number;
  message: string;
  recipientUserId: number;
  status: string; // "Pending" | "Accepted" | "Declined"
};

export const InviteUserModal = ({
  opened,
  onClose,
  discussionId,
  senderUserId,
}: InviteUserModalProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useUser();

  const handleSend = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      showNotification({
        message: "Please enter a username.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Get all users
      const usersRes = await api.get<ApiResponse<UserDto[]>>("/api/users");

      if (usersRes.data.hasErrors || !usersRes.data.data) {
        showNotification({
          message: "Could not load users to look up that username.",
          color: "red",
        });
        return;
      }

      // 2. Find matching username (case-insensitive)
      const match = usersRes.data.data.find(
        (u) => u.userName.toLowerCase() === trimmed.toLowerCase()
      );

      if (!match) {
        showNotification({
          message: "No user found with that username.",
          color: "red",
        });
        return;
      }

      const payload: InviteCreateDto = {
        discussionId,
        senderUserId,
        recipientUserId: match.id,
        message: `${user.userName} has sent you an invite`,
        status: "Pending",
      };

      // 3. Send invite
      const res = await api.post<ApiResponse<any>>("/api/invites", payload);

      if (res.data.hasErrors) {
        const firstError = res.data.errors?.[0];
        showNotification({
          message: firstError?.message ?? "Could not send invite.",
          color: "red",
        });
        return;
      }

      showNotification({
        message: `Invite sent to ${match.userName}!`,
        color: "green",
      });
      setUsername("");
      onClose();
    } catch (err) {
      showNotification({
        message: "Something went wrong sending the invite.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Invite user to discussion"
      centered
    >
      <Stack>
        <TextInput
          label="Recipient Username"
          placeholder="Enter the user's username"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />

        <Button onClick={handleSend} loading={loading}>
          Send Invite
        </Button>
      </Stack>
    </Modal>
  );
};
