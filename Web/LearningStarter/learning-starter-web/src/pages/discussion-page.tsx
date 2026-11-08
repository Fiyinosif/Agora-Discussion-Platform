import { InviteUserModal } from "../components/InviteUserModal";
import DiscussionReactionBar from "../components/DiscussionReactionBar";
import { useEffect, useMemo, useState } from "react";
import {
  ApiResponse,
  DiscussionGetDto,
  DiscussionSettingsGetDto,
  MemberCreateDto,
  MemberGetDto,
  Privacy,
  ResponseCreateDto,
  ResponseGetDto,
  Role,
} from "../constants/types";
import api from "../config/axios";
import { showNotification } from "@mantine/notifications";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IconSettings } from "@tabler/icons-react";
import {
  Box,
  Button,
  Card,
  Container,
  Drawer,
  Flex,
  Group,
  Menu,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useUser } from "../authentication/use-auth";
import { HeadCard } from "../components/head-card/head-card";
import { ResponseCard } from "../components/response-card/response-card";
import { IconTrash } from "@tabler/icons-react";

import { DiscussionMembersPanel } from "../components/member-panel/member-panel";
import { routes } from "../routes";

export const DiscussionPage = () => {
  const [discussion, setDiscussion] = useState<DiscussionGetDto>();
  const [responses, setResponses] = useState<ResponseGetDto[]>([]);
  const [replyBody, setReplyBody] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nestedReplies, setNestedReplies] = useState<
    Record<number, ResponseGetDto[]>
  >({});
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const [replying, toggleReplying] = useState<boolean>(false);
  const [inviteModalOpened, setInviteModalOpened] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "">("");
  const [members, setMembers] = useState<MemberGetDto[]>([]);

  const { id } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { setting?: DiscussionSettingsGetDto };
  const setting = state?.setting;
  const sortedResponses = useMemo(() => {
    const arr = [...responses];
    if (sortBy === "newest") {
      return arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sortBy === "oldest") {
      return arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  }, [responses, sortBy]);

  const userRole = useMemo(() => {
    return (
      discussion?.members.find((m) => m.id === user.id)?.role ?? Role.Member
    );
  }, [discussion, user.id]);

  useEffect(() => {
    if (!id) return;
    fetchDiscussion(id);

    fetchResponses(id).then((responsesData) => {
      // fetches child responses on render for number display
      responsesData.forEach((response) => fetchChildReplies(response.id));
    });
  }, [id]);

  async function fetchDiscussion(id: string) {
    const res = await api.get<ApiResponse<DiscussionGetDto>>(
      `/api/discussions/${id}`
    );
    if (!res.data.hasErrors && res.data.data) {
      setDiscussion(res.data.data);
      setMembers(res.data.data.members);
    }
  }

  async function fetchResponses(id: string) {
    const res = await api.get<ApiResponse<ResponseGetDto[]>>(
      `/api/discussions/${id}/replies`
    );
    if (!res.data.hasErrors && res.data.data) {
      setResponses(res.data.data);
      return res.data.data; // <-- return the array
    }
    return [];
  }

  async function fetchChildReplies(parentId: number) {
    const res = await api.get<ApiResponse<ResponseGetDto[]>>(
      `/api/discussions/${parentId}/replies`
    );

    if (res.data.hasErrors) {
      showNotification({
        message: "Error fetching nested replies",
        color: "red",
      });
      return;
    }

    setNestedReplies((prev) => ({
      ...prev,
      [parentId]: res.data.data,
    }));
  }

  async function handleReply(parentId?: number) {
    if (!replyBody.trim() || !id) return;

    setLoading(true);
    try {
      // Add user to discussion members if not already in list
      if (
        setting?.maxMembers &&
        discussion!.members.length >= setting.maxMembers &&
        !discussion!.members.some((m) => m.id === user.id)
      ) {
        navigate(routes.warningLimit);
        return;
      }
      if (discussion && !discussion.members.some((m) => m.id === user.id)) {
        const memberRes = await api.post<ApiResponse<DiscussionGetDto>>(
          `/api/discussions/${discussion.id}/members/${user.id}?role=Member`
        );

        if (!memberRes.data.hasErrors) {
          const allMembers = memberRes.data.data.members;
          const newMember = allMembers.find((m) => m.id === user.id);
          if (newMember) {
            setMembers((prev) => [...prev, newMember]);
            showNotification({ message: "Members updated" });
          }
        }
      }
      // Post the response
      const res = await api.post<ApiResponse<ResponseCreateDto>>(
        `/api/discussions`,
        {
          body: replyBody,
          parentId: parentId,
          createdByUserId: user.id,
        }
      );

      if (res.data.hasErrors) {
        showNotification({ message: "Error posting response", color: "red" });
        return;
      }

      showNotification({ message: "Response posted!", color: "green" });
      setReplyBody("");
      setReplyTargetId(null);

      // Refresh replies
      if (parentId && parentId !== Number(id)) {
        await fetchChildReplies(parentId);
      } else {
        await fetchResponses(id);
      }
    } catch {
      showNotification({ message: "Something went wrong", color: "red" });
    } finally {
      setLoading(false);
    }
  }

  const toggleReplies = async (responseId: number) => {
    const isExpanded = expandedReplies.has(responseId);
    const updated = new Set(expandedReplies);
    if (isExpanded) {
      updated.delete(responseId);
    } else {
      updated.add(responseId);
      if (!nestedReplies[responseId]) {
        await fetchChildReplies(responseId);
      }
    }
    setExpandedReplies(updated);
  };

  const isBanned =
    discussion?.bannedUsers?.some((b) => b.userId === user.id) ?? false;

  const canInvite =
    !!discussion &&
    !!user &&
    !isBanned &&
    // Allow the discussion owner, or members with elevated roles (Admin/Owner), to invite/manage
    (discussion.owner?.id === user.id ||
      discussion.members?.some(
        (m) => m.id === user.id && m.role !== Role.Member
      ));

  useEffect(() => {
    // don't run until discussion is loaded
    if (!discussion) return;

    const isOwner = discussion.owner?.id === user.id;
    const isMember = discussion.members?.some((m) => m.id === user.id) ?? false;
    const bannedUser = discussion.bannedUsers.find(
      (m) => m.userId === user.id && discussion.id === m.discussionId
    );

    if (isBanned) {
      navigate("/warning/banned", {
        state: {
          reason: bannedUser!.reason,
          expirationDate: bannedUser!.expirationDate,
        },
      });
      return;
    }

    if (setting?.privacy !== undefined) {
      if (setting.privacy !== Privacy.Public && !isOwner && !isMember) {
        navigate("/warning/invite", {
          state: { discussionId: discussion.id, ownerId: discussion.owner.id },
        });
        return;
      }
    } else {
      navigate("/warning", {
        state: { discussionId: discussion.id, ownerId: discussion.owner.id },
      });
    }
  }, [discussion, setting, user.id, isBanned, navigate]);

  // Renders child responses
  const renderReplies = (parentId: number, depth = 1) => {
    const replies = nestedReplies[parentId];
    if (!replies || replies.length === 0) return null;

    return (
      <Stack mt="xs" ml={depth * 20}>
        {replies.map((r) => (
          <Card
            key={r.id}
            shadow="xs"
            padding="sm"
            radius="md"
            withBorder
            mb="xs"
          >
            <Group justify="space-between" mb="xs">
              <Text
                fw={500}
                onClick={() => {
                  navigate(`/userprofile/${r.owner.id}`);
                }}
              >
                {r.owner.userName}
              </Text>
              <Text size="xs" c="dimmed">
                {new Date(r.createdAt).toLocaleDateString()}
              </Text>
            </Group>
            <Text size="sm">{r.body}</Text>

            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <DiscussionReactionBar
                discussionId={r.id}
                currentUserId={(user?.id as number) ?? r.owner?.id ?? 0}
              />
            </div>
            {depth < 1 ? (
              <Group mt="xs">
                <Button
                  size="xs"
                  variant="light"
                  color="green"
                  onClick={() => {
                    setReplyTargetId(r.id);
                    toggleReplying(!replying);
                  }}
                >
                  Reply
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  color="blue"
                  onClick={() => toggleReplies(r.id)}
                >
                  {expandedReplies.has(r.id)
                    ? "Hide Replies ▲"
                    : `View Replies ▼ (${nestedReplies[r.id]?.length || 0})`}
                </Button>

                {/*   DELETE BUTTON  */}
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDeleteReply(r.id)}
                  leftSection={<IconTrash size={14} />}
                >
                  Delete
                </Button>
              </Group>
            ) : (
              <></>
            )}

            {/* Reply prompt for replying to a response */}
            {replyTargetId === r.id && replying && (
              <Stack mt="xs">
                <Textarea
                  placeholder={`Replying to ${r.owner.userName}...`}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.currentTarget.value)}
                  minRows={2}
                />
                <Button
                  size="sm"
                  onClick={() => handleReply(r.id)}
                  loading={loading}
                  disabled={!replyBody.trim()}
                >
                  Post Reply
                </Button>
              </Stack>
            )}

            {/* Recursive render of nested replies */}
            {expandedReplies.has(r.id) && renderReplies(r.id, depth + 1)}
          </Card>
        ))}
      </Stack>
    );
  };

  async function handleDeleteReply(replyId: number) {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      const res = await api.delete<ApiResponse<boolean>>(
        `/api/discussions/${replyId}`
      );

      if (res.data.hasErrors) {
        showNotification({ message: "Error deleting reply", color: "red" });
        return;
      }

      showNotification({ message: "Reply deleted", color: "green" });

      // Refresh top-level replies if we're on a discussion page
      if (id) await fetchResponses(id);

      // Remove the deleted reply from any nestedReplies arrays
      setNestedReplies((prev) => {
        const updated: Record<number, ResponseGetDto[]> = { ...prev };
        Object.keys(updated).forEach((k) => {
          const key = Number(k);
          if (Number.isNaN(key)) return;
          updated[key] = (updated[key] || []).filter((r) => r.id !== replyId);
        });
        return updated;
      });
    } catch {
      showNotification({ message: "Something went wrong", color: "red" });
    }
  }

  return (
    <Flex>
      <Container size="md" py="md" w="100%">
        {/* Head Discussion */}
        <HeadCard
          discussion={discussion}
          setReplyTargetId={setReplyTargetId}
          replyTargetId={replyTargetId}
          replying={replying}
          toggleReplying={toggleReplying}
        />{" "}
        {/* Invite */}
        {canInvite && (
          <Group justify="flex-end" mb="md" mt="sm">
            {discussion?.owner?.id === user.id && (
              <Button
                variant="light"
                leftSection={<IconSettings size={16} />}
                onClick={() =>
                  navigate(`/discussion/${discussion.id}/settings`)
                }
              >
                Settings
              </Button>
            )}
            <Button onClick={() => setInviteModalOpened(true)}>
              Invite User
            </Button>
          </Group>
        )}
        {/* Sort Control */}
        <Group justify="flex-end" mt="md" mb="sm">
          <Select
            label="Sort replies"
            value={sortBy}
            onChange={(v) => setSortBy(v as "newest" | "oldest")}
            data={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
            ]}
            w={200}
          />
        </Group>
        {/* Responses */}
        <ResponseCard
          responses={responses}
          setReplyTargetId={setReplyTargetId}
          replying={replying}
          toggleReplying={toggleReplying}
          expandedReplies={expandedReplies}
          toggleReplies={toggleReplies}
          handleReply={handleReply}
          nestedReplies={nestedReplies}
          renderReplies={renderReplies}
          replyTargetId={replyTargetId}
          replyBody={replyBody}
          setReplyBody={setReplyBody}
          loading={loading}
          userRole={userRole}
          handleDeleteReply={handleDeleteReply}
        />
        {/* Reply prompt for replying to head discussion */}
        {replyTargetId === Number(id) && replying && (
          <Card
            shadow="lg"
            withBorder
            radius="md"
            p="md"
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 700,
              zIndex: 1000,
              backgroundColor: "var(--mantine-color-body)",
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.15)",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Text fw={600} mb="xs" ta="center">
              Add a Response
            </Text>
            <Textarea
              placeholder="Write your response..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.currentTarget.value)}
              minRows={3}
              radius="sm"
              autosize
            />

            {discussion && (
              <InviteUserModal
                opened={inviteModalOpened}
                onClose={() => setInviteModalOpened(false)}
                discussionId={discussion.id}
                senderUserId={user.id}
              />
            )}
            <Button
              fullWidth
              mt="sm"
              onClick={() => handleReply(Number(id))}
              loading={loading}
              disabled={!replyBody.trim()}
            >
              Post Response
            </Button>
          </Card>
        )}
      </Container>
      <Box mih="100vh">
        <DiscussionMembersPanel
          key={members.length}
          discussion={discussion}
          members={members}
        />
      </Box>
    </Flex>
  );
};
