import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../config/axios";
import {
  ApiResponse,
  DiscussionSettingsGetDto,
  InviteGetDto,
} from "../constants/types";
import { useUser } from "../authentication/use-auth";
import { useNavigate } from "react-router-dom";

export const MyInvitesPage = () => {
  const user = useUser();
  const [invites, setInvites] = useState<InviteGetDto[]>([]);
  const [settings, setSettings] = useState<DiscussionSettingsGetDto[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const navigate = useNavigate();

  const loadInvites = async () => {
    if (!user?.id) return;

    try {
      const res = await api.get<ApiResponse<InviteGetDto[]>>(
        `/api/invites/user/${user.id}`
      );

      if (!res.data.hasErrors && res.data.data) {
        setInvites(res.data.data);
      } else {
        showNotification({
          message: "Could not load invites.",
          color: "red",
        });
      }
    } catch (e) {
      showNotification({
        message: "Error loading invites.",
        color: "red",
      });
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.get<ApiResponse<DiscussionSettingsGetDto[]>>(
        "/api/discussionsettings"
      );

      if (!res.data.hasErrors && res.data.data) {
        setSettings(res.data.data);
      } else {
        showNotification({
          message: "Could not load invites.",
          color: "red",
        });
      }
    } catch (e) {
      showNotification({
        message: "Error loading invites.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    loadInvites();
    loadSettings();
  }, [user?.id]);

  const handleUpdateStatus = async (
    invite: InviteGetDto,
    status: "Accepted" | "Declined"
  ) => {
    setLoadingId(invite.id);
    try {
      // 1) Update invite status
      const res = await api.put<ApiResponse<InviteGetDto>>(
        `/api/invites/${invite.id}`,
        { status }
      );

      if (res.data.hasErrors) {
        showNotification({
          message: res.data.errors?.[0]?.message ?? "Could not update invite.",
          color: "red",
        });
        return;
      }

      // 2) If accepted, add user as a Member to that discussion
      if (status === "Accepted") {
        const isRequestInvite = invite.message
          .toLowerCase()
          .includes("would like to join");

        const memberToAdd = isRequestInvite
          ? invite.senderUserId // sender joins for request invites
          : user.id; // recipient joins for normal invites

        try {
          await api.post(
            `/api/discussions/${invite.discussionId}/members/${memberToAdd}?role=Member`
          );
        } catch {
          console.error("Failed to add member after accepting invite.");
        }
      }

      // 3) Refresh list
      await loadInvites();
    } catch {
      showNotification({
        message: "Error updating invite.",
        color: "red",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const pendingInvites = invites.filter((i) => i.status === "Pending");

  return (
    <Container size="sm" py="md">
      <Title order={2} mb="md">
        My Invites
      </Title>

      {invites.length === 0 && (
        <Text c="dimmed">You don't have any invites yet.</Text>
      )}

      <Stack>
        {invites.map((invite) => {
          return (
            <Card key={invite.id} shadow="sm" withBorder radius="md" p="md">
              <Group justify="space-between" mb="xs">
                <Text
                  mb="xs"
                  fw={700}
                  onClick={() => {
                    navigate(`/discussion/${invite.discussionId}`, {
                      state: {
                        setting: settings.find(
                          (s) => s.discussionId === invite.discussionId
                        ),
                      },
                    });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Discussion Title:{" "}
                  {
                    settings.find((s) => s.discussionId === invite.discussionId)
                      ?.title
                  }
                </Text>
                <Badge
                  color={
                    invite.status === "Pending"
                      ? "yellow"
                      : invite.status === "Accepted"
                      ? "blue"
                      : "red"
                  }
                >
                  {invite.status}
                </Badge>
              </Group>
              <Divider mb="md" />
              <Text size="sm" mb="xs">
                From <Text span>{invite.senderUserName}</Text>
              </Text>
              <Text>{invite.message}</Text>

              <Group mt="md">
                <Text size="xs" c="dimmed">
                  Sent: {new Date(invite.createdAt).toLocaleString()}
                </Text>
                {invite.status === "Pending" ? (
                  <>
                    <Button
                      size="xs"
                      color="green"
                      loading={loadingId === invite.id}
                      onClick={() => handleUpdateStatus(invite, "Accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      variant="outline"
                      loading={loadingId === invite.id}
                      onClick={() => handleUpdateStatus(invite, "Declined")}
                    >
                      Decline
                    </Button>
                  </>
                ) : (
                  <Text size="xs" c="dimmed">
                    {invite.status === "Accepted"
                      ? "You accepted this invite."
                      : "You declined this invite."}
                  </Text>
                )}
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};
