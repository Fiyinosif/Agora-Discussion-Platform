import React, { useEffect, useState, useCallback } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { showNotification } from "@mantine/notifications";
import { useUser } from "../../authentication/use-auth";
import api from "../../config/axios";
import {
  ApiResponse,
  DiscussionGetDto,
  DiscussionSettingsGetDto,
  FollowerGetDto,
  FollowingGetDto,
  Privacy,
} from "../../constants/types";
import { DiscussionCard } from "../../components/discussion-card.tsx/discussion-card";
import { IconChevronDown } from "@tabler/icons-react";

const useStyles = createStyles(() => ({
  sectionCard: {
    marginBottom: "1.5rem",
  },
  clickableHeader: {
    cursor: "pointer",
  },
}));

export const UserPage = () => {
  const user = useUser();
  const { classes } = useStyles();

  const [followers, setFollowers] = useState<FollowerGetDto[]>([]);
  const [following, setFollowing] = useState<FollowingGetDto[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionGetDto[]>([]);
  const [discussionSettings, setDiscussionSettings] = useState<
    DiscussionSettingsGetDto[]
  >([]);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<DiscussionGetDto | null>(null);

  // --- Load user-related data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [followersRes, followingRes, discussionsRes, settingsRes] =
          await Promise.all([
            api.get<ApiResponse<FollowerGetDto[]>>(
              `/api/followers/${user.id}/followers`
            ),
            api.get<ApiResponse<FollowingGetDto[]>>(
              `/api/followers/${user.id}/following`
            ),
            api.get<ApiResponse<DiscussionGetDto[]>>("/api/discussions"),
            api.get<ApiResponse<DiscussionSettingsGetDto[]>>(
              "/api/discussionsettings"
            ),
          ]);

        if (!followersRes.data.hasErrors && followersRes.data.data)
          setFollowers(followersRes.data.data);

        if (!followingRes.data.hasErrors && followingRes.data.data)
          setFollowing(followingRes.data.data);

        if (!discussionsRes.data.hasErrors && discussionsRes.data.data)
          setDiscussions(
            discussionsRes.data.data.filter((d) => d.owner.id === user.id)
          );

        if (!settingsRes.data.hasErrors && settingsRes.data.data)
          setDiscussionSettings(settingsRes.data.data);
      } catch (error) {
        console.error(error);
        showNotification({ message: "Error loading user data" });
      }
    };

    loadData();
  }, [user.id]);
  const openDeleteModal = (discussion: DiscussionGetDto) => {
    setSelectedDiscussion(discussion);
    setDeleteModalOpen(true);
  };

  const publicDiscussions = discussions.filter((d) =>
    discussionSettings.some(
      (s) => s.discussionId === d.id && s.privacy === Privacy.Public
    )
  );

  const privateDiscussions = discussions.filter((d) =>
    discussionSettings.some(
      (s) => s.discussionId === d.id && s.privacy !== Privacy.Public
    )
  );

  // Step 3b: When the user confirms delete
  const confirmDelete = async () => {
    if (!selectedDiscussion) return;

    try {
      const res = await api.delete<ApiResponse<null>>(
        `/api/discussions/${selectedDiscussion.id}`
      );

      if (!res.data.hasErrors) {
        setDiscussions((prev) =>
          prev.filter((d) => d.id !== selectedDiscussion.id)
        );
        showNotification({
          title: "Discussion deleted",
          message: `"${selectedDiscussion.body.slice(
            0,
            30
          )}..." was deleted successfully.`,
          color: "green",
        });
      } else {
        showNotification({
          title: "Error",
          message: "Failed to delete the discussion.",
          color: "red",
        });
      }
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong while deleting the discussion.",
        color: "red",
      });
    } finally {
      setDeleteModalOpen(false);
      setSelectedDiscussion(null);
    }
  };

  return (
    <Container size="md" py="xl">
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete "${selectedDiscussion?.body.slice(0, 30)}..."?`}
        centered
      >
        <Text>
          Are you sure you want to delete this discussion? This action cannot be
          undone.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>

      {/* --- Profile Header --- */}
      <Card
        withBorder
        radius="lg"
        shadow="md"
        mb="xl"
        style={{
          background: "linear-gradient(135deg, #1e293b, #334155)",
          color: "white",
        }}
      >
        <Flex direction="column" align="center" py="lg" gap="sm">
          <Avatar
            radius="xl"
            size={100}
            color="blue"
            src={null}
            alt={`${user.firstName} ${user.lastName}`}
          >
            {user.firstName?.[0]}
          </Avatar>

          <Title order={3}>
            {user.firstName} {user.lastName}
          </Title>

          <Badge variant="filled" color="blue" radius="sm" size="lg">
            {user.userName}
          </Badge>

          <Group mt="sm" gap="lg">
            <Text fw={600}>
              {followers.length}{" "}
              <Text span fw={400} c="gray.4">
                Followers
              </Text>
            </Text>
            <Text fw={600}>
              {following.length}{" "}
              <Text span fw={400} c="gray.4">
                Following
              </Text>
            </Text>
          </Group>
        </Flex>
      </Card>

      {/* --- Followers Section --- */}
      <Card withBorder radius="md" shadow="sm" className={classes.sectionCard}>
        <Group
          justify="space-between"
          className={classes.clickableHeader}
          onClick={() => setFollowersOpen((o) => !o)}
        >
          <Title order={4}>Followers</Title>
          <IconChevronDown
            style={{
              transform: followersOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.2s",
            }}
          />
        </Group>

        <Collapse in={followersOpen}>
          <Divider my="sm" />
          {followers.length === 0 ? (
            <Text c="dimmed">No followers yet.</Text>
          ) : (
            <Stack gap="xs">
              {followers.map((f) => (
                <Flex key={f.id} align="center" gap="sm">
                  <Avatar size="sm">{f.followerUserName[0]}</Avatar>
                  <Text>{f.followerUserName}</Text>
                </Flex>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* --- Following Section --- */}
      <Card withBorder radius="md" shadow="sm" className={classes.sectionCard}>
        <Group
          justify="space-between"
          className={classes.clickableHeader}
          onClick={() => setFollowingOpen((o) => !o)}
        >
          <Title order={4}>Following</Title>
          <IconChevronDown
            style={{
              transform: followingOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.2s",
            }}
          />
        </Group>

        <Collapse in={followingOpen}>
          <Divider my="sm" />
          {following.length === 0 ? (
            <Text c="dimmed">Not following anyone yet.</Text>
          ) : (
            <Stack gap="xs">
              {following.map((f) => (
                <Flex key={f.id} align="center" gap="sm">
                  <Avatar size="sm">{f.followingUserName[0]}</Avatar>
                  <Text>{f.followingUserName}</Text>
                </Flex>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* --- Discussions Section --- */}
      <Card shadow="sm" radius="md" withBorder>
        <Title order={4} mb="xs">
          Public
        </Title>
        <Divider mb="sm" />

        {publicDiscussions.length === 0 ? (
          <Text c="dimmed" mb="md">
            No public discussions yet.
          </Text>
        ) : (
          <Grid gutter="lg" mb="xl">
            {publicDiscussions.map((d) => {
              const setting = discussionSettings.find(
                (s) => s.discussionId === d.id
              );
              return (
                <Grid.Col span={{ base: 12, sm: 6 }} key={d.id}>
                  <Flex align="center" direction="column">
                    <DiscussionCard
                      discussion={d}
                      settings={setting}
                      privacy={setting!.privacy}
                      isLocked={
                        setting!.privacy !== Privacy.Public &&
                        !d.members.some((m) => m.id === user.id) &&
                        d.owner.id !== user.id
                      }
                      onDelete={() => openDeleteModal(d)}
                    />
                  </Flex>
                </Grid.Col>
              );
            })}
          </Grid>
        )}

        <Title order={4} mt="lg" mb="xs">
          Private
        </Title>
        <Divider mb="sm" />

        {privateDiscussions.length === 0 ? (
          <Text c="dimmed">No private discussions.</Text>
        ) : (
          <Grid gutter="lg" mb="xl">
            {privateDiscussions.map((d) => {
              const setting = discussionSettings.find(
                (s) => s.discussionId === d.id
              );
              return (
                <Grid.Col span={{ base: 12, sm: 6 }} key={d.id}>
                  <Flex align="center" direction="column">
                    <DiscussionCard
                      discussion={d}
                      settings={setting}
                      privacy={setting!.privacy}
                      isLocked={
                        setting!.privacy !== Privacy.Public &&
                        !d.members.some((m) => m.id === user.id) &&
                        d.owner.id !== user.id
                      }
                      onDelete={() => openDeleteModal(d)}
                    />
                  </Flex>
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Card>
    </Container>
  );
};
