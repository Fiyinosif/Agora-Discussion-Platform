import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Stack,
  Group,
  Button,
  Textarea,
  TextInput,
  Select,
  MultiSelect,
  NumberInput,
  Checkbox,
  Text,
  Loader,
  Center,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import api from "../config/axios";
import { useUser } from "../authentication/use-auth";
import {
  ApiResponse,
  TagGetDto,
  Privacy,
  MemberCreateDto,
  DiscussionGetDto,
  Role,
  DiscussionSettingsGetDto,
} from "../constants/types";

interface DiscussionCreatePayload {
  body: string;
  createdByUserId: number;
  parentId?: number | null;
}

interface DiscussionSettingsPayload {
  discussionId: number;
  title: string;
  maxMembers?: number | null;
  privacy: string;
}

export const CreateDiscussionPage = () => {
  const navigate = useNavigate();
  const user = useUser();

  // Form state
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState<string | null>("Public");
  const [maxMembers, setMaxMembers] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [createSettings, setCreateSettings] = useState(true);

  // Loading and data states
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<TagGetDto[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  // Fetch available tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      const res = await api.get<ApiResponse<TagGetDto[]>>("/api/tags");
      if (!res.data.hasErrors && res.data.data) {
        setAvailableTags(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      showNotification({
        message: "Failed to load tags",
        color: "red",
      });
    } finally {
      setTagsLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      showNotification({
        message: "Tag name cannot be empty",
        color: "red",
      });
      return;
    }

    try {
      setCreatingTag(true);
      const res = await api.post<ApiResponse<TagGetDto>>("/api/tags", {
        name: newTagName.trim(),
      });

      if (!res.data.hasErrors && res.data.data) {
        setAvailableTags([...availableTags, res.data.data]);
        setSelectedTags([...selectedTags, res.data.data.id.toString()]);
        setNewTagName("");
        showNotification({
          message: "Tag created and added!",
          color: "green",
        });
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      showNotification({
        message: "Failed to create tag",
        color: "red",
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleCreateDiscussion = async () => {
    // Validation
    if (!body.trim()) {
      showNotification({
        message: "Discussion body cannot be empty",
        color: "red",
      });
      return;
    }

    if (createSettings && !title.trim()) {
      showNotification({
        message: "Discussion title cannot be empty when creating settings",
        color: "red",
      });
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create the discussion
      const discussionPayload: DiscussionCreatePayload = {
        body: body.trim(),
        createdByUserId: user.id,
      };

      const discussionRes = await api.post<ApiResponse<any>>(
        "/api/discussions",
        discussionPayload
      );

      if (discussionRes.data.hasErrors) {
        showNotification({
          message: "Failed to create discussion",
          color: "red",
        });
        return;
      }

      const newDiscussionId = discussionRes.data.data.id;
      await api.post<ApiResponse<MemberCreateDto>>(
        `/api/discussions/${newDiscussionId}/members/${user.id}?role=Owner`
      );

      const settingsPayload: DiscussionSettingsPayload = {
        discussionId: newDiscussionId,
        title: title ? title.trim() : "Untitled",
        maxMembers: maxMembers && maxMembers > 0 ? maxMembers : null,
        privacy: privacy ? privacy : "Public",
      };

      const settingsRes = await api.post<ApiResponse<any>>(
        "/api/discussionsettings",
        settingsPayload
      );

      if (settingsRes.data.hasErrors) {
        console.warn(
          "Discussion created but settings failed:",
          settingsRes.data.errors
        );
        showNotification({
          message:
            "Discussion created, but settings failed. You can edit settings later.",
          color: "yellow",
        });
      }

      // Step 3: Add tags if selected
      if (selectedTags.length > 0 && newDiscussionId) {
        for (const tagId of selectedTags) {
          try {
            await api.post(
              `/api/discussions/${newDiscussionId}/tags/${parseInt(tagId)}`
            );
          } catch (error) {
            console.warn(`Failed to add tag ${tagId}:`, error);
          }
        }
      }

      showNotification({
        message: "Discussion created successfully!",
        color: "green",
      });

      // Redirect to the new discussion
      navigate(`/discussion/${newDiscussionId}`, {
        state: { setting: settingsPayload },
      });
    } catch (error) {
      console.error("Error creating discussion:", error);
      showNotification({
        message: "An error occurred while creating the discussion",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const tagOptions = availableTags.map((tag) => ({
    value: tag.id.toString(),
    label: tag.name,
  }));

  return (
    <Container size="md" py="xl">
      <Card radius="lg" shadow="md" withBorder>
        <Stack gap="lg">
          <div>
            <Text fw={700} size="xl" mb="xs">
              Create a New Discussion
            </Text>
            <Text c="dimmed" size="sm">
              Start a new conversation
            </Text>
          </div>

          {/* Discussion Body */}
          <Textarea
            label="Discussion Content"
            placeholder="What would you like to discuss?"
            minRows={8}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            disabled={loading}
            required
          />

          {/* Settings Section */}
          <Card withBorder padding="md" radius="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>Discussion Settings</Text>
                <Checkbox
                  label="Configure settings"
                  checked={createSettings}
                  onChange={(e) => setCreateSettings(e.currentTarget.checked)}
                  disabled={loading}
                />
              </Group>

              {createSettings && (
                <>
                  <TextInput
                    label="Discussion Title"
                    placeholder="Give your discussion a title"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                    disabled={loading}
                    required
                  />

                  <Select
                    label="Privacy Level"
                    placeholder="Select privacy"
                    data={["Public", "Private", "InviteOnly"]}
                    value={privacy}
                    onChange={setPrivacy}
                    disabled={loading}
                  />

                  <NumberInput
                    label="Max Members (Optional)"
                    placeholder="Leave empty for unlimited"
                    value={maxMembers || ""}
                    onChange={(value) =>
                      setMaxMembers(value ? Number(value) : null)
                    }
                    disabled={loading}
                    min={1}
                  />
                </>
              )}
            </Stack>
          </Card>

          {/* Tags Section */}
          <div>
            {tagsLoading ? (
              <Center py="md">
                <Loader size="sm" />
              </Center>
            ) : (
              <Stack gap="sm">
                <MultiSelect
                  label="Add Tags (Optional)"
                  placeholder="Select tags to categorize your discussion"
                  data={tagOptions}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  disabled={loading || tagsLoading}
                  searchable
                />

                <Group gap="xs">
                  <TextInput
                    placeholder="Create new tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.currentTarget.value)}
                    disabled={creatingTag || loading}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateTag();
                      }
                    }}
                  />
                  <Button
                    onClick={handleCreateTag}
                    loading={creatingTag}
                    disabled={!newTagName.trim() || creatingTag || loading}
                  >
                    Add Tag
                  </Button>
                </Group>
              </Stack>
            )}
          </div>

          {/* Action Buttons */}
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDiscussion}
              loading={loading}
              disabled={loading || !body.trim()}
            >
              Create Discussion
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
};
