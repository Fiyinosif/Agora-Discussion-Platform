import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Select,
  TextInput,
  Badge,
  useMantineTheme,
  useMantineColorScheme,
  Divider,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { routes } from "../../routes";
import {
  ApiResponse,
  DiscussionGetDto,
  DiscussionSettingsGetDto,
  TagGetDto,
  Privacy,
} from "../../constants/types";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const surfaceBg = isDark ? theme.colors.dark[8] : theme.colors.gray[0];
  const cardBg = isDark ? theme.colors.dark[7] : theme.white;
  const softCardBg = isDark ? theme.colors.dark[6] : theme.white;
  const subtleBorder = isDark
    ? "1px solid rgba(148,163,184,0.35)"
    : "1px solid rgba(15,23,42,0.06)";

  // ---- REFS ----
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // ---- STATE ----
  const [discussions, setDiscussions] = useState<DiscussionGetDto[]>([]);
  const [discussionSettings, setDiscussionSettings] = useState<
    DiscussionSettingsGetDto[]
  >([]);
  const [allTags, setAllTags] = useState<TagGetDto[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewFilter, setViewFilter] = useState<"all" | "public" | "invite">(
    "all"
  );

  // ---- FETCH REAL DATA ----
  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, discussionsRes, tagsRes] = await Promise.all([
          api.get<ApiResponse<DiscussionSettingsGetDto[]>>(
            "/api/discussionsettings"
          ),
          api.get<ApiResponse<DiscussionGetDto[]>>("/api/discussions"),
          api.get<ApiResponse<TagGetDto[]>>("/api/tags"),
        ]);

        if (settingsRes.data.data) {
          setDiscussionSettings(settingsRes.data.data);
        }

        if (tagsRes.data.data) {
          setAllTags(tagsRes.data.data);
        }

        if (discussionsRes.data.data) {
          const root = discussionsRes.data.data.filter(
            (d) => d.parentId === null
          );
          setDiscussions(root);
        }
      } catch (err) {
        console.error(err);
        showNotification({
          message: "Error fetching discussions",
          color: "red",
        });
      }
    })();
  }, []);

  // ---- HELPERS ----

  const getSettingsFor = (discussionId: number) =>
    discussionSettings.find((s) => s.discussionId === discussionId);

  const getTitle = (d: DiscussionGetDto) => {
    const s = getSettingsFor(d.id);
    if (s?.title) return s.title;
    const trimmed =
      d.body?.length && d.body.length > 40
        ? `${d.body.slice(0, 40)}…`
        : d.body || "Untitled";
    return trimmed;
  };

  const isPublic = (d: DiscussionGetDto) => {
    const s = getSettingsFor(d.id);
    if (!s) return true; // default to public if no settings
    return s.privacy === Privacy.Public;
  };

  const activityScore = (d: DiscussionGetDto) => {
    const now = Date.now();
    const created = new Date(d.createdAt).getTime();
    const ageDays = (now - created) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 7 - ageDays);
    return d.reactions.length * 2 + d.members.length + recencyBoost;
  };

  const tagOptions = useMemo(() => {
    const names = new Set<string>();
    allTags.forEach((t) => {
      if (t.name) names.add(t.name);
    });
    return [
      { value: "all", label: "All tags" },
      ...Array.from(names).map((name) => ({
        value: name.toLowerCase(),
        label: name,
      })),
    ];
  }, [allTags]);

  // apply search, tag filter, sort
  const processedDiscussions = useMemo(() => {
    let list = [...discussions];

    // tag filter
    if (selectedTag !== "all") {
      const tagValue = selectedTag.toLowerCase();
      list = list.filter((d) =>
        d.tags?.some((t) => t.name.toLowerCase() === tagValue)
      );
    }

    // search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((d) => {
        const title = getTitle(d).toLowerCase();
        const body = (d.body || "").toLowerCase();
        return title.includes(term) || body.includes(term);
      });
    }

    // sort
    list.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });

    return list;
  }, [discussions, selectedTag, searchTerm, sortOrder]);

  const publicDiscussions = useMemo(
    () => processedDiscussions.filter((d) => isPublic(d)),
    [processedDiscussions]
  );

  const inviteDiscussions = useMemo(
    () => processedDiscussions.filter((d) => !isPublic(d)),
    [processedDiscussions]
  );

  // Visible lists based on Quick views filter
  const visiblePublic = useMemo(
    () => (viewFilter === "invite" ? [] : publicDiscussions),
    [publicDiscussions, viewFilter]
  );

  const visibleInvite = useMemo(
    () => (viewFilter === "public" ? [] : inviteDiscussions),
    [inviteDiscussions, viewFilter]
  );

  const trending = useMemo(
    () =>
      [...discussions]
        .sort((a, b) => activityScore(b) - activityScore(a))
        .slice(0, 3),
    [discussions]
  );

  const renderTags = (d: DiscussionGetDto) => {
    if (!d.tags || d.tags.length === 0) return null;
    return (
      <Group gap={6} mt={4}>
        {d.tags.map((tag) => (
          <Badge
            key={tag.id ?? tag.name}
            size="xs"
            radius="sm"
            variant="outline"
            color="blue"
          >
            {tag.name}
          </Badge>
        ))}
      </Group>
    );
  };

  // ---- HANDLERS ----

  const handleBrowseDiscussions = () => {
    // Smooth scroll to the search input area and focus the field
    if (searchInputRef.current) {
      searchInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // small delay so focus happens after scroll animation starts
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    } else {
      // fallback: scroll to the whole list section
      const element = document.getElementById("discussions-list");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // ---- RENDER ----
  return (
    <Box bg={surfaceBg} mih="100vh">
      <Container size="xl" py="lg" fluid>
        {/* HERO */}
        <Paper
          radius="lg"
          p="xl"
          mb="xl"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, #2563eb 0, #0f172a 55%, #020617 100%)",
            border: "1px solid rgba(15,23,42,0.5)",
            boxShadow: "0 24px 80px rgba(15,23,42,0.6)",
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap="md" maw={560}>
              <Title
                order={1}
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: "white",
                }}
              >
                Welcome to Agora
              </Title>

              <Text
                size="md"
                style={{ color: "rgba(226,232,240,0.9)", maxWidth: 520 }}
              >
                Discover communities, share ideas, and connect with people who
                care about the same things you do.
              </Text>

              <Group mt="sm">
                <Button
                  radius="xl"
                  size="md"
                  style={{ fontWeight: 600 }}
                  onClick={() => navigate(routes.createDiscussion)}
                >
                  Start a discussion
                </Button>

                <Button
                  radius="xl"
                  size="md"
                  variant="outline"
                  style={{
                    borderColor: "rgba(148,163,184,0.6)",
                    color: "white",
                    backgroundColor: "rgba(15,23,42,0.6)",
                  }}
                  onClick={handleBrowseDiscussions}
                >
                  Browse discussions
                </Button>
              </Group>

              <Group gap="xs" mt="sm" wrap="wrap">
                <Badge
                  radius="xl"
                  variant="light"
                  color="blue"
                  styles={{
                    root: {
                      backgroundColor: "rgba(59,130,246,0.15)",
                      color: "#bfdbfe",
                      border: "none",
                    },
                  }}
                >
                  No noise. Just real topics.
                </Badge>
                <Badge
                  radius="xl"
                  variant="light"
                  styles={{
                    root: {
                      backgroundColor: "rgba(15,23,42,0.7)",
                      color: "#e5e7eb",
                      border: "1px solid rgba(148,163,184,0.4)",
                    },
                  }}
                >
                  Join in seconds.
                </Badge>
                <Badge
                  radius="xl"
                  variant="light"
                  styles={{
                    root: {
                      backgroundColor: "rgba(30,64,175,0.7)",
                      color: "#e5e7eb",
                      border: "none",
                    },
                  }}
                >
                  Built for thoughtful conversation.
                </Badge>
              </Group>
            </Stack>

            {/* Right stats card */}
            <Paper
              radius="lg"
              p="lg"
              withBorder={false}
              style={{
                minWidth: 260,
                maxWidth: 320,
                background:
                  "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))",
                border: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              <Text size="xs" c="dimmed" mb={4}>
                TODAY ON AGORA
              </Text>
              <Text size="lg" fw={700} c="white" mb="xs">
                {discussions.length} live spaces
              </Text>
              <Text size="sm" c="dimmed">
                Public and invite-only discussions to explore right now.
              </Text>
            </Paper>
          </Group>
        </Paper>

        {/* FILTERS + LIST SECTION */}
        <Paper
          radius="lg"
          p="lg"
          id="discussions-list"
          style={{
            backgroundColor: cardBg,
            border: subtleBorder,
          }}
        >
          {/* Top controls: SORT, SEARCH, TAGS */}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
            {/* SORT BY */}
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb={4}>
                SORT BY
              </Text>
              <Select
                placeholder="Latest first"
                data={[
                  { value: "latest", label: "Latest first" },
                  { value: "oldest", label: "Oldest first" },
                ]}
                value={sortOrder}
                onChange={(val) =>
                  setSortOrder((val as "latest" | "oldest") ?? "latest")
                }
                radius="md"
              />
            </Box>

            {/* SEARCH */}
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb={4}>
                SEARCH
              </Text>
              <TextInput
                placeholder="Search discussions..."
                radius="md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                ref={searchInputRef}
              />
            </Box>

            {/* TAGS FILTER */}
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb={4}>
                TAGS
              </Text>
              <Select
                placeholder="Filter by tags"
                data={tagOptions}
                value={selectedTag}
                onChange={(val) => setSelectedTag(val ?? "all")}
                radius="md"
              />
            </Box>
          </SimpleGrid>

          {/* MAIN CONTENT + SIDEBAR */}
          <SimpleGrid cols={{ base: 1, lg: 4 }} spacing="lg">
            {/* MAIN LIST (3 cols on desktop) */}
            <Box style={{ gridColumn: "span 3" }}>
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  Showing {visiblePublic.length} public and{" "}
                  {visibleInvite.length} invite-only discussion
                  {visiblePublic.length + visibleInvite.length === 1 ? "" : "s"}
                </Text>

                {/* PUBLIC SECTION */}
                <Box>
                  <Text fw={600} size="sm" mb="xs">
                    Public discussions
                  </Text>
                  {visiblePublic.length === 0 && (
                    <Text size="sm" c="dimmed">
                      No public discussions match your filters yet.
                    </Text>
                  )}
                  <Stack gap="sm">
                    {visiblePublic.map((d) => (
                      <Paper
                        key={d.id}
                        radius="md"
                        p="md"
                        style={{
                          backgroundColor: softCardBg,
                          border: subtleBorder,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(`/discussion/${d.id}`, {
                            state: { setting: getSettingsFor(d.id) },
                          })
                        }
                      >
                        <Group justify="space-between" align="flex-start">
                          <Stack gap={4}>
                            <Text fw={600}>{getTitle(d)}</Text>
                            <Text size="sm" c="dimmed">
                              {d.body}
                            </Text>
                            {renderTags(d)}
                            <Text size="xs" c="dimmed">
                              {new Date(d.createdAt).toLocaleDateString()} ·{" "}
                              {d.members.length} member
                              {d.members.length === 1 ? "" : "s"} ·{" "}
                              {d.reactions.length} reaction
                              {d.reactions.length === 1 ? "" : "s"}
                            </Text>
                          </Stack>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                <Divider my="sm" />

                {/* INVITE-ONLY SECTION */}
                <Box>
                  <Text fw={600} size="sm" mb="xs">
                    Invite-only discussions
                  </Text>
                  {visibleInvite.length === 0 && (
                    <Text size="sm" c="dimmed">
                      No invite-only discussions match your filters yet.
                    </Text>
                  )}
                  <Stack gap="sm">
                    {visibleInvite.map((d) => (
                      <Paper
                        key={d.id}
                        radius="md"
                        p="md"
                        style={{
                          backgroundColor: softCardBg,
                          border: subtleBorder,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(`/discussion/${d.id}`, {
                            state: { setting: getSettingsFor(d.id) },
                          })
                        }
                      >
                        <Group justify="space-between" align="flex-start">
                          <Stack gap={4}>
                            <Group gap="xs">
                              <Text fw={600}>{getTitle(d)}</Text>
                              <Badge
                                size="xs"
                                radius="sm"
                                color="violet"
                                variant="light"
                              >
                                INVITE-ONLY
                              </Badge>
                            </Group>
                            <Text size="sm" c="dimmed">
                              {d.body}
                            </Text>
                            {renderTags(d)}
                            <Text size="xs" c="dimmed">
                              {new Date(d.createdAt).toLocaleDateString()} ·{" "}
                              {d.members.length} member
                              {d.members.length === 1 ? "" : "s"} ·{" "}
                              {d.reactions.length} reaction
                              {d.reactions.length === 1 ? "" : "s"}
                            </Text>
                          </Stack>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* SIDEBAR: Quick views + Trending this week */}
            <Stack gap="sm">
              <Paper
                radius="md"
                p="md"
                style={{
                  backgroundColor: softCardBg,
                  border: subtleBorder,
                }}
              >
                {/* QUICK VIEWS */}
                <Text fw={600} size="sm" mb="xs">
                  Quick views
                </Text>

                <Stack gap={6} mb="sm">
                  {/* All discussions */}
                  <Box
                    onClick={() => setViewFilter("all")}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                      backgroundColor:
                        viewFilter === "all"
                          ? isDark
                            ? "rgba(15,23,42,0.9)"
                            : theme.colors.gray[0]
                          : "transparent",
                    }}
                  >
                    <Group gap="xs">
                      <Box
                        w={8}
                        h={8}
                        style={{
                          borderRadius: 999,
                          backgroundColor: theme.colors.blue[5],
                        }}
                      />
                      <Text size="sm">All discussions</Text>
                    </Group>
                  </Box>

                  {/* Public only */}
                  <Box
                    onClick={() => setViewFilter("public")}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                      backgroundColor:
                        viewFilter === "public"
                          ? isDark
                            ? "rgba(15,23,42,0.9)"
                            : theme.colors.gray[0]
                          : "transparent",
                    }}
                  >
                    <Group gap="xs">
                      <Box
                        w={8}
                        h={8}
                        style={{
                          borderRadius: 999,
                          backgroundColor: theme.colors.green[5],
                        }}
                      />
                      <Text size="sm">Public only</Text>
                    </Group>
                  </Box>

                  {/* Invite-only */}
                  <Box
                    onClick={() => setViewFilter("invite")}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                      backgroundColor:
                        viewFilter === "invite"
                          ? isDark
                            ? "rgba(15,23,42,0.9)"
                            : theme.colors.gray[0]
                          : "transparent",
                    }}
                  >
                    <Group gap="xs">
                      <Box
                        w={8}
                        h={8}
                        style={{
                          borderRadius: 999,
                          backgroundColor: theme.colors.violet[5],
                        }}
                      />
                      <Text size="sm">Invite-only</Text>
                    </Group>
                  </Box>
                </Stack>

                <Divider my="sm" />

                {/* TRENDING THIS WEEK */}
                <Text fw={600} size="sm" mb="xs">
                  Trending this week
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  Based on reactions, members, and recency.
                </Text>

                <Stack gap="xs">
                  {trending.map((d, idx) => (
                    <Box
                      key={d.id}
                      onClick={() =>
                        navigate(`/discussion/${d.id}`, {
                          state: {
                            setting: discussionSettings.find(
                              (s) => s.discussionId === d.id
                            ),
                          },
                        })
                      }
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        backgroundColor: isDark
                          ? "rgba(15,23,42,0.8)"
                          : theme.colors.gray[0],
                        cursor: "pointer",
                      }}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={2} maw="80%">
                          <Group gap={6}>
                            <Badge
                              size="xs"
                              radius="sm"
                              variant="filled"
                              color="blue"
                            >
                              #{idx + 1}
                            </Badge>
                            <Text size="sm" fw={600} lineClamp={1}>
                              {getTitle(d)}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {d.reactions.length} reactions · {d.members.length}{" "}
                            members
                          </Text>
                        </Stack>
                        <Text size="xs" c="dimmed">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Box>
                  ))}

                  {trending.length === 0 && (
                    <Text size="sm" c="dimmed">
                      Not enough activity yet. Start a discussion to see trends
                      here.
                    </Text>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </SimpleGrid>
        </Paper>
      </Container>
    </Box>
  );
};
