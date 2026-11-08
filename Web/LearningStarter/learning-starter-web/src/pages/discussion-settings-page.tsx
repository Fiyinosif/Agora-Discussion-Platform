// --- imports unchanged ---

import {
  Tabs,
  Text,
  Card,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Button,
  Table,
  Group,
  Modal,
  Badge,
  Divider,
  Checkbox,
  Container,
  Flex,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../authentication/use-auth";
import api from "../config/axios";
import {
  Privacy,
  MemberGetDto,
  TagGetDto,
  ApiResponse,
  DiscussionSettingsGetDto,
  bannedUsersGetDto,
  Role,
  DiscussionGetDto,
} from "../constants/types";
import { showNotification } from "@mantine/notifications";

export const DiscussionSettingsPage = () => {
  // SETTINGS
  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>(Privacy.Public);
  const [maxMembers, setMaxMembers] = useState<number | string>();

  const [discussion, setDiscussion] = useState<DiscussionGetDto | null>(null);

  // MEMBERS
  const [members, setMembers] = useState<MemberGetDto[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberGetDto | null>(
    null
  );
  const [bannedUsers, setBannedUsers] = useState<bannedUsersGetDto[]>();
  const [banReason, setBanReason] = useState("");
  const [banPermanent, setBanPermanent] = useState(true);
  const [banDuration, setBanDuration] = useState("00:00:00");
  // TAG STATE
  const [selectedTags, setSelectedTags] = useState<TagGetDto[]>([]);
  const [availableTags, setAvailableTags] = useState<TagGetDto[]>([]);
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [tagToAdd, setTagToAdd] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const isOwner = discussion && discussion.owner.id === user.id;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      settingsRes,
      membersRes,
      tagsRes,
      allTagsRes,
      bannedUsers,
      discussionRes,
    ] = await Promise.all([
      api.get<ApiResponse<DiscussionSettingsGetDto>>(
        `/api/discussions/${id}/settings`
      ),
      api.get<ApiResponse<MemberGetDto[]>>(`/api/discussions/${id}/members`),
      api.get<ApiResponse<TagGetDto[]>>(`/api/discussions/${id}/tags`),
      api.get<ApiResponse<TagGetDto[]>>(`/api/tags`),
      api.get<ApiResponse<bannedUsersGetDto[]>>(
        `/api/discussions/${id}/bannedusers`
      ),
      await api.get<ApiResponse<DiscussionGetDto>>(`/api/discussions/${id}`),
    ]);

    const settings = settingsRes.data.data;

    setTitle(settings.title);
    setPrivacy(settings.privacy);
    setMaxMembers(settings.maxMembers ?? "");
    setDiscussion(discussionRes.data.data);

    setMembers(membersRes.data.data);
    setBannedUsers(bannedUsers.data.data);
    setSelectedTags(tagsRes.data.data);
    setAvailableTags(allTagsRes.data.data);

    setLoading(false);
  }

  async function handleSaveSettings() {
    if (!checkOwner()) return;
    const max = maxMembers === "" ? null : Number(maxMembers);

    await api.put(`/api/discussionsettings/${id}`, {
      title,
      privacy,
      maxMembers: max,
    });

    loadData();
  }

  async function handleRoleChange(newRole: number) {
    if (!selectedMember || !checkOwner()) return;

    try {
      await api.put(
        `/api/discussions/${id}/members/${selectedMember.id}?role=${newRole}`,
        {} // axios requires second arg
      );

      setRoleModalOpen(false);
      setSelectedMember(null);
      loadData();
    } catch {
      console.error("Failed role update");
    }
  }
  async function handleUnbanUser(banId: number) {
    await api.delete(`/api/BannedUsers/${banId}`);
    await api.post(`/api/discussions/${id}/members/${banId}?role=Member`);
    loadData();
  }
  async function handleAddTag() {
    if (!tagToAdd) return;
    await api.post(`/api/discussions/${id}/tags/${tagToAdd}`);
    setTagToAdd(null);
    setAddTagOpen(false);
    loadData();
  }
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
        setSelectedTags([...selectedTags, res.data.data]);
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
  async function handleRemoveTag(tagId: number) {
    await api.delete(`/api/discussions/${id}/tags/${tagId}`);
    loadData();
  }

  // --------------------------
  // BAN MEMBER (your working endpoint)
  // --------------------------
  const banMember = async () => {
    if (selectedMember!.role === Role.Owner) {
      showNotification({
        message: "You cannot ban the owner",
        color: "red",
      });
      return;
    }

    try {
      const res = await api.post<ApiResponse<bannedUsersGetDto>>(
        "/api/BannedUsers",
        {
          userId: selectedMember!.id,
          userName: selectedMember?.userName,
          discussionId: id,
          reason: banReason,
          bannedByUserId: user.id,
          bannedByUserName: user.userName,
          isPermanent: banPermanent,
          duration: banPermanent ? "00:00:00" : banDuration,
          isActive: true,
        }
      );
      if (res.data.hasErrors) {
        showNotification({ message: "Error banning user. Please try again" });
        return;
      }

      await api.delete(`/api/discussions/${id}/members/${selectedMember!.id}`);

      showNotification({ message: "User banned", color: "green" });
      setBanModalOpen(false);

      // Reset modal inputs
      setBanReason("");
      setBanPermanent(true);
      setBanDuration("00:00:00");

      loadData();
    } catch {
      showNotification({ message: "Failed to ban user", color: "red" });
    }
  };

  const checkOwner = () => {
    if (!isOwner) {
      showNotification({
        message: "You don't have permission to manage this discussion",
        color: "red",
      });
      return false;
    }
    return true;
  };
  if (!discussion) {
    return (
      <Container>
        <Card>
          <Text>Discussion not found</Text>
        </Card>
      </Container>
    );
  }

  if (!isOwner) {
    return (
      <Container>
        <Card>
          <Text c="red">
            You don't have permission to manage this discussion
          </Text>
          <Button mt="md" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Tabs defaultValue="settings" pt="md">
      <Tabs.List>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
        <Tabs.Tab value="members">Members({members.length})</Tabs.Tab>
        <Tabs.Tab value="tags">Tags({selectedTags.length})</Tabs.Tab>
        <Tabs.Tab value="bans">Banned Users({bannedUsers?.length})</Tabs.Tab>
      </Tabs.List>

      {/* ---------------- SETTINGS TAB ---------------- */}
      <Tabs.Panel value="settings" pt="md">
        <Card withBorder radius="md" p="md">
          <Stack>
            <TextInput
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Select
              label="Privacy"
              data={[
                { value: "0", label: "Public" },
                { value: "1", label: "Private" },
                { value: "2", label: "Invite Only" },
              ]}
              value={privacy.toString()}
              onChange={(v) => v && setPrivacy(Number(v))}
            />

            <NumberInput
              label="Max Members"
              value={maxMembers}
              onChange={(v) => setMaxMembers(v)}
              min={1}
            />

            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </Stack>
        </Card>
      </Tabs.Panel>

      {/* ---------------- MEMBERS TAB ---------------- */}
      <Tabs.Panel value="members" pt="md">
        <Card withBorder radius="md" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {members.map((m) => (
                <Table.Tr key={m.id}>
                  <Table.Td>{m.userName}</Table.Td>
                  <Table.Td>
                    {m.role === 0 ? "Owner" : m.role === 1 ? "Admin" : "Member"}
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      {m.role !== 0 && (
                        <Button
                          size="xs"
                          onClick={() => {
                            setSelectedMember(m);
                            setRoleModalOpen(true);
                          }}
                        >
                          Change Role
                        </Button>
                      )}

                      {m.role !== 0 && (
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => {
                            setSelectedMember(m);
                            setBanModalOpen(true);
                          }}
                        >
                          Ban
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Tabs.Panel>

      {/* ROLE CHANGE MODAL */}
      <Modal
        opened={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Change Role"
      >
        <Stack>
          <Select
            label="Select New Role"
            data={[
              { value: "1", label: "Admin" },
              { value: "2", label: "Member" },
            ]}
            onChange={(v) => v && handleRoleChange(Number(v))}
          />
        </Stack>
      </Modal>

      {/* BAN MODAL */}
      <Modal
        opened={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title="Ban Member"
      >
        <Stack>
          <Text>
            Are you sure you want to ban this user? Fill out the details below.
          </Text>

          <TextInput
            label="Reason"
            placeholder="Rule violation, spam, etc."
            value={banReason}
            onChange={(e) => setBanReason(e.currentTarget.value)}
          />

          <Checkbox
            label="Permanent Ban"
            checked={banPermanent}
            onChange={(e) => setBanPermanent(e.currentTarget.checked)}
          />

          {!banPermanent && (
            <TextInput
              label="Duration (HH:MM:SS)"
              placeholder="01:00:00"
              value={banDuration}
              onChange={(e) => setBanDuration(e.currentTarget.value)}
            />
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setBanModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={banMember} disabled={!banReason}>
              Ban User
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* TAGS */}
      <Tabs.Panel value="tags" pt="md">
        <Card withBorder radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={500}>Discussion Tags</Text>
            <Button size="xs" onClick={() => setAddTagOpen(true)}>
              Add Tag
            </Button>
          </Group>

          <Group gap="xs" mb="md">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="filled"
                size="lg"
                rightSection={
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      marginLeft: 8,
                    }}
                    onClick={() => handleRemoveTag(tag.id)}
                  >
                    ×
                  </button>
                }
              >
                {tag.name}
              </Badge>
            ))}
          </Group>

          <Divider mb="md" />

          <Modal
            opened={addTagOpen}
            onClose={() => setAddTagOpen(false)}
            title="Add Tag"
          >
            <Stack>
              <Select
                label="Available Tags"
                placeholder="Select a tag"
                data={availableTags.map((t) => ({
                  value: t.id.toString(),
                  label: t.name,
                }))}
                value={tagToAdd?.toString() || null}
                onChange={(v) => setTagToAdd(v ? Number(v) : null)}
              />

              <Button onClick={handleAddTag} disabled={!tagToAdd}>
                Add Tag
              </Button>
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
            </Stack>
          </Modal>
        </Card>
      </Tabs.Panel>
      {/* ---------------- BANS TAB ---------------- */}
      <Tabs.Panel value="bans" pt="md">
        <Card withBorder radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <Text fw={500}>Banned Users</Text>
          </Group>

          {loading ? (
            <Text>Loading...</Text>
          ) : bannedUsers!.length === 0 ? (
            <Text>No banned users</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Reason</Table.Th>
                  <Table.Th>Permanent?</Table.Th>
                  <Table.Th>Banned By</Table.Th>
                  <Table.Th>Expiration Date</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {bannedUsers!.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>{b.userName}</Table.Td>
                    <Table.Td>{b.reason}</Table.Td>

                    <Table.Td>
                      <Badge color={b.isPermanent ? "red" : "yellow"}>
                        {b.isPermanent ? "Permanent" : "Temporary"}
                      </Badge>
                    </Table.Td>

                    <Table.Td>{b.bannedByUserName}</Table.Td>
                    <Table.Td>
                      {b?.expirationDate
                        ? new Date(b.expirationDate).toLocaleDateString()
                        : "Permanent"}
                    </Table.Td>

                    <Table.Td>
                      <Button
                        size="xs"
                        color="green"
                        onClick={() => handleUnbanUser(b.id)}
                      >
                        Unban
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      </Tabs.Panel>
    </Tabs>
  );
};
