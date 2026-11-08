import {
  Center,
  Container,
  Divider,
  Flex,
  Grid,
  MultiSelect,
  Paper,
  Select,
  Space,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import {
  ApiResponse,
  DiscussionGetDto,
  DiscussionSettingsGetDto,
  FollowingGetDto,
  Privacy,
  TagGetDto,
} from "../../constants/types";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { DiscussionCard } from "../../components/discussion-card.tsx/discussion-card";
import { useUser } from "../../authentication/use-auth";

export const UserDiscussionPage = () => {
  const [discussions, setDiscussions] = useState<DiscussionGetDto[]>([]);
  const [discussionSettings, setDiscussionSettings] = useState<
    DiscussionSettingsGetDto[]
  >([]);
  const [allTags, setAllTags] = useState<TagGetDto[]>([]);
  const [followingIds, setFollowingIds] = useState<number[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<"all" | "likes" | "members">(
    "all"
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const user = useUser();

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;

        const [settingsRes, discussionsRes, tagsRes, followingRes] =
          await Promise.all([
            api.get<ApiResponse<DiscussionSettingsGetDto[]>>(
              "/api/discussionsettings"
            ),
            api.get<ApiResponse<DiscussionGetDto[]>>("/api/discussions"),
            api.get<ApiResponse<TagGetDto[]>>("/api/tags"),
            api.get<ApiResponse<FollowingGetDto[]>>(
              `/api/followers/${user.id}/following`
            ),
          ]);

        if (settingsRes.data.data) setDiscussionSettings(settingsRes.data.data);
        if (discussionsRes.data.data)
          setDiscussions(
            discussionsRes.data.data.filter((d) => d.parentId === null)
          );
        if (tagsRes.data.data) setAllTags(tagsRes.data.data);
        if (followingRes.data.data)
          setFollowingIds(followingRes.data.data.map((f) => f.followingId));
      } catch (err) {
        console.error(err);
        showNotification({
          message: "Error fetching discussions",
          color: "red",
        });
      }
    })();
  }, [user]);

  const applyFilters = (
    base: DiscussionGetDto[],
    settings: DiscussionSettingsGetDto[]
  ) => {
    const query = searchQuery.toLowerCase();

    let filtered = base.filter((d) => {
      const setting = settings.find((s) => s.discussionId === d.id);
      if (!setting) return false;

      const matchesQuery =
        !query ||
        setting.title.toLowerCase().includes(query) ||
        d.members?.some((m) => m.userName.toLowerCase().includes(query));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) =>
          d.tags?.some((t) => t.name.toLowerCase() === tag.toLowerCase())
        );

      return matchesQuery && matchesTags;
    });

    switch (filterOption) {
      case "likes":
        filtered.sort(
          (a, b) =>
            (b.reactions?.filter((r) => r.reactionType === "Like").length ||
              0) -
            (a.reactions?.filter((r) => r.reactionType === "Like").length || 0)
        );
        break;
      case "members":
        filtered.sort(
          (a, b) => (b.members?.length || 0) - (a.members?.length || 0)
        );
        break;
    }

    return filtered;
  };

  const owned = discussions.filter((d) => d.owner.id === user.id);
  const member = discussions.filter(
    (d) => d.owner.id !== user.id && d.members?.some((m) => m.id === user.id)
  );
  const following = discussions.filter(
    (d) =>
      d.owner.id !== user.id &&
      !d.members?.some((m) => m.id === user.id) &&
      followingIds.includes(d.owner.id) &&
      discussionSettings.find(
        (s) => s.discussionId === d.id && s.privacy === Privacy.Public
      )
  );

  const ownedFiltered = useMemo(
    () => applyFilters(owned, discussionSettings),
    [owned, discussionSettings, searchQuery, selectedTags, filterOption]
  );
  const memberFiltered = useMemo(
    () => applyFilters(member, discussionSettings),
    [member, discussionSettings, searchQuery, selectedTags, filterOption]
  );
  const followingFiltered = useMemo(
    () => applyFilters(following, discussionSettings),
    [following, discussionSettings, searchQuery, selectedTags, filterOption]
  );

  const renderSection = (
    label: string,
    items: DiscussionGetDto[],
    emptyMessage: string
  ) => (
    <>
      <Divider
        my="xl"
        label={
          <Text size="lg" fw={600} c="dimmed" tt="uppercase" lts={1}>
            {label}
          </Text>
        }
        labelPosition="center"
        size="sm"
      />
      <Space h="md" />
      <Grid gutter={40} py={40}>
        {items.length > 0 ? (
          items.map((d) => {
            const setting = discussionSettings.find(
              (s) => s.discussionId === d.id
            );
            if (!setting) return null;
            return (
              <Grid.Col key={d.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                {
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
                }
              </Grid.Col>
            );
          })
        ) : (
          <Center>
            <Text size="sm">{emptyMessage}</Text>
          </Center>
        )}
      </Grid>
    </>
  );

  return (
    <Container size="lg">
      <Title
        order={2}
        ta="center"
        mb="lg"
        fw={800}
        pb={rem(50)}
        style={{ letterSpacing: "0.5px" }}
      >
        My Discussions
      </Title>

      {/* --- Search & Filters --- */}
      <Paper
        withBorder
        style={{
          borderRadius: "1rem",
          padding: "1.8rem",
          marginBottom: "2.8rem",
          background: "var(--mantine-color-dark-6)",
          border: "1px solid var(--mantine-color-dark-4)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Grid gutter="lg" align="center">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <TextInput
              placeholder="Search discussions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && setSearchQuery(searchInput.trim())
              }
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 5 }}>
            <MultiSelect
              data={allTags.map((t) => ({ value: t.name, label: t.name }))}
              placeholder="Filter by tags"
              value={selectedTags}
              onChange={setSelectedTags}
              searchable
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              value={filterOption}
              onChange={(v: any) => setFilterOption(v)}
              data={[
                { value: "all", label: "All" },
                { value: "likes", label: "Most Liked" },
                { value: "members", label: "Most Members" },
              ]}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* --- Sections --- */}
      {renderSection(
        "Your Discussions",
        ownedFiltered,
        "No owned discussions found."
      )}
      {renderSection(
        "Discusions you've joined",
        memberFiltered,
        "You are not a member of any discussions."
      )}
      {renderSection(
        "Created by users you are Following",
        followingFiltered,
        "No discussions found from users you follow."
      )}
    </Container>
  );
};
