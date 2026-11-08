import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Flex,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import {
  ApiResponse,
  DiscussionGetDto,
  DiscussionSettingsGetDto,
  FollowerCreateDto,
  FollowerGetDto,
  FollowingGetDto,
  Privacy,
  UserDto,
} from "../../constants/types";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { DiscussionCard } from "../../components/discussion-card.tsx/discussion-card";
import { useUser } from "../../authentication/use-auth";

export const UserProfilePage = () => {
  const { id } = useParams();
  const user = useUser();

  const [profileUser, setProfileUser] = useState<UserDto | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionGetDto[]>([]);
  const [discussionSettings, setDiscussionSettings] = useState<
    DiscussionSettingsGetDto[]
  >([]);
  const [followers, setFollowers] = useState<FollowerGetDto[]>([]);
  const [following, setFollowing] = useState<FollowingGetDto[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // --- Fetch profile data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get user first
        const userRes = await api.get<ApiResponse<UserDto>>(`/api/users/${id}`);
        if (userRes.data.hasErrors || !userRes.data.data) {
          showNotification({ message: "Error fetching user data" });
          return;
        }
        const fetchedUser = userRes.data.data;
        setProfileUser(fetchedUser);

        // Fetch everything else in parallel
        const [discussionRes, settingsRes, followersRes, followingRes] =
          await Promise.all([
            api.get<ApiResponse<DiscussionGetDto[]>>("/api/discussions"),
            api.get<ApiResponse<DiscussionSettingsGetDto[]>>(
              "/api/discussionsettings"
            ),
            api.get<ApiResponse<FollowerGetDto[]>>(
              `/api/followers/${id}/followers`
            ),
            api.get<ApiResponse<FollowingGetDto[]>>(
              `/api/followers/${id}/following`
            ),
          ]);

        // Handle each response
        if (!discussionRes.data.hasErrors)
          setDiscussions(
            (discussionRes.data.data ?? []).filter(
              (d) => d.owner.id === fetchedUser.id && d.parentId === null
            )
          );
        if (!settingsRes.data.hasErrors)
          setDiscussionSettings(settingsRes.data.data ?? []);
        if (!followersRes.data.hasErrors)
          setFollowers(followersRes.data.data ?? []);

        if (!followingRes.data.hasErrors)
          setFollowing(followingRes.data.data ?? []);

        const isUserFollowing = (followersRes.data.data ?? []).some(
          (f: FollowerGetDto) => f.followerId === user.id
        );
        setIsFollowing(isUserFollowing);
      } catch (error) {
        console.error(error);
        showNotification({ message: "Unexpected error occurred" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // --- Update follow state ---
  const handleFollowToggle = useCallback(async () => {
    setFollowLoading(true);

    try {
      if (isFollowing) {
        // --- Unfollow ---
        await api.delete(`/api/followers/${user.id}/${profileUser!.id}`);

        // Optimistic update (remove)
        setFollowers((prev) => prev.filter((f) => f.followerId !== user.id));
        setIsFollowing(false);

        showNotification({
          message: `You unfollowed ${profileUser!.userName}`,
          color: "red",
        });
      } else {
        // --- Follow ---
        const res = await api.post<ApiResponse<FollowerCreateDto>>(
          "/api/followers",
          {
            followerId: user.id,
            followingId: profileUser!.id,
          }
        );

        if (res.data.hasErrors) {
          showNotification({ message: "Error following user" });
          return;
        }

        setFollowers((prev) => [
          ...prev,
          {
            followerId: user.id,
            followerUserName: user.userName,
            followingId: profileUser!.id,
            followingUserName: profileUser!.userName,
            followedAt: new Date(),
          } as FollowerGetDto,
        ]);

        setIsFollowing(true);

        showNotification({
          message: `You followed ${profileUser!.userName}`,
          color: "teal",
        });
      }
    } catch (error) {
      console.error(error);
      showNotification({ message: "Error updating follow status" });
    } finally {
      setFollowLoading(false);
    }
  }, [isFollowing, profileUser, user.id, user.userName]);

  const visibleDiscussions = useMemo(
    () =>
      discussions.filter((d) => {
        const setting = discussionSettings.find((s) => s.discussionId === d.id);
        const isLocked =
          setting?.privacy !== Privacy.Public &&
          !d.members.some((m) => m.id === user.id);
        return setting?.privacy !== Privacy.Private || !isLocked;
      }),
    [discussions, discussionSettings, user.id]
  );

  // --- Loading Skeleton ---
  if (loading || !profileUser) {
    return (
      <Container size="md" py="xl">
        <Card radius="lg" shadow="md" withBorder>
          <Stack align="center" gap="sm" py="lg">
            <Skeleton height={100} circle />
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} width="40%" />
            <Skeleton height={36} width={100} />
          </Stack>
        </Card>
      </Container>
    );
  }
  return (
    <Container size="md" py="xl">
      {/* Profile Header */}
      <Card
        withBorder
        radius="lg"
        shadow="md"
        style={{
          background: "linear-gradient(135deg, #1e293b, #334155)",
          color: "white",
        }}
        mb="xl"
      >
        <Flex direction="column" align="center" py="lg" gap="sm">
          <Avatar radius="xl" size={100} color="blue">
            {profileUser.firstName[0]}
            {profileUser.lastName[0]}
          </Avatar>

          <Title order={3}>
            {profileUser.firstName} {profileUser.lastName}
          </Title>

          <Badge variant="filled" color="blue" radius="sm" size="lg">
            {profileUser.userName}
          </Badge>

          {profileUser.id !== user.id && (
            <Button
              mt="md"
              color={isFollowing ? "gray" : "blue"}
              loading={followLoading}
              onClick={handleFollowToggle}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}

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

      {/* Followers Section */}
      <Card withBorder radius="md" shadow="sm" mb="xl">
        <Group
          justify="space-between"
          onClick={() => setFollowersOpen((o) => !o)}
          style={{ cursor: "pointer" }}
        >
          <Title order={4}>Followers</Title>
          {followersOpen ? <IconChevronUp /> : <IconChevronDown />}
        </Group>

        <Collapse in={followersOpen}>
          <Divider my="sm" />
          {followers.length === 0 ? (
            <Text c="dimmed">No followers yet.</Text>
          ) : (
            <Stack gap="xs">
              {followers.map((f) => (
                <Flex key={f.id} align="center" gap="sm">
                  <Link
                    to={`/userprofile/${f.followerId}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Group gap="xs">
                      <Avatar size="sm">{f.followerUserName[0]}</Avatar>
                      <Text>{f.followerUserName}</Text>
                    </Group>
                  </Link>
                </Flex>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* Following Section */}
      <Card withBorder radius="md" shadow="sm" mb="xl">
        <Group
          justify="space-between"
          onClick={() => setFollowingOpen((o) => !o)}
          style={{ cursor: "pointer" }}
        >
          <Title order={4}>Following</Title>
          {followingOpen ? <IconChevronUp /> : <IconChevronDown />}
        </Group>

        <Collapse in={followingOpen}>
          <Divider my="sm" />
          {following.length === 0 ? (
            <Text c="dimmed">Not following anyone yet.</Text>
          ) : (
            <Stack gap="xs">
              {following.map((f) => (
                <Link
                  key={f.id}
                  to={`/userprofile/${f.followingId}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Flex align="center" gap="sm">
                    <Avatar size="sm">{f.followingUserName[0]}</Avatar>
                    <Text>{f.followingUserName}</Text>
                  </Flex>
                </Link>
              ))}
            </Stack>
          )}
        </Collapse>
      </Card>

      {/* Discussions Section */}
      <Card shadow="sm" radius="md" withBorder>
        <Group mb="md">
          <Title order={4}>Discussions by {profileUser.userName}</Title>
        </Group>
        <Divider mb="md" />

        {visibleDiscussions.length === 0 ? (
          <Text c="dimmed" ta="center" py="md">
            {profileUser.id === user.id
              ? "You haven't started any discussions yet."
              : `${profileUser.userName} hasn't posted any discussions yet.`}
          </Text>
        ) : (
          <div>
            {discussions.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">
                You haven't started any discussions yet.
              </Text>
            ) : (
              <Flex wrap="wrap" gap="md" justify="flex-start">
                {discussions.map((d) => {
                  const setting = discussionSettings?.find(
                    (s) =>
                      s.discussionId === d.id && s.privacy === Privacy.Public
                  );

                  if (!setting) return null;

                  const isLocked =
                    setting.privacy !== Privacy.Public &&
                    !d.members.some((m) => m.id === user.id);

                  return (
                    <DiscussionCard
                      discussion={d}
                      settings={setting}
                      privacy={setting.privacy}
                      isLocked={
                        setting.privacy !== Privacy.Public &&
                        !d.members.some((m) => m.id === user.id) &&
                        d.owner.id !== user.id
                      }
                    />
                  );
                })}
              </Flex>
            )}
          </div>
        )}
      </Card>
    </Container>
  );
};
