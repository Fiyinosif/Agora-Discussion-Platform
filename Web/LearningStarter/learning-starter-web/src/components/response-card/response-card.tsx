import React from "react";
import { Stack, Card, Group, Button, Textarea, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { Privacy, ResponseGetDto, Role } from "../../constants/types";
import { useNavigate } from "react-router-dom";
import DiscussionReactionBar from "../DiscussionReactionBar";
import { useUser } from "../../authentication/use-auth";
import CommentSettings from "../comment-settings";

type ResponseCardProps = {
  responses: ResponseGetDto[];
  setReplyTargetId: (id: number | null) => void;
  replying: boolean;
  toggleReplying: (value: boolean) => void;
  expandedReplies: Set<number>;
  toggleReplies: (id: number) => void;
  handleReply: (parentId: number) => void;
  nestedReplies: Record<number, ResponseGetDto[]>;
  renderReplies: (parentId: number) => React.ReactNode;
  replyTargetId: number | null;
  replyBody: string;
  setReplyBody: (value: string) => void;
  loading: boolean;
  userRole: Role;
  handleDeleteReply: (id: number) => void;
};

export const ResponseCard: React.FC<ResponseCardProps> = ({
  responses,
  setReplyTargetId,
  replying,
  toggleReplying,
  expandedReplies,
  toggleReplies,
  handleReply,
  nestedReplies,
  renderReplies,
  replyTargetId,
  replyBody,
  setReplyBody,
  loading,
  userRole,
  handleDeleteReply,
}) => {
  const navigate = useNavigate();
  const user = useUser();

  return (
    <Stack>
      <Text fw={600} size="md">
        Responses
      </Text>

      {responses.length === 0 && <Text size="sm">No responses yet.</Text>}

      {responses.map((response) => (
        <Card
          key={response.id}
          shadow="xs"
          padding="md"
          radius="md"
          withBorder
          mb="sm"
        >
          <Group justify="space-between" mb="xs">
            <Text
              fw={500}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/userprofile/${response.owner.id}`)}
            >
              {response.owner.userName}
            </Text>
            <Text size="xs">
              {new Date(response.createdAt).toLocaleDateString()}
            </Text>
            <CommentSettings
              reply={{
                id: response.id,
                content: response.body,
                created_at: new Date(response.createdAt).toISOString(),
                /*discussionId: response.discussionId,*/
                user: {
                  username: response.owner.userName,
                  id: response.owner.id,
                },
                handleDeleteReply: (id) => handleDeleteReply(id),
              }}
              currentUserRole={userRole}
              handleDeleteReply={handleDeleteReply}
            />
          </Group>

          <Text size="sm" mb="xs">
            {response.body}
          </Text>

          {/* 👍👎 reactions for this response */}
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <DiscussionReactionBar
              discussionId={response.id}
              currentUserId={(user?.id as number) ?? response.owner?.id ?? 0}
            />
          </div>

          <Group>
            <Button
              size="xs"
              variant="light"
              color="green"
              onClick={() => {
                if (replyTargetId === response.id) {
                  // Clicking the same "Reply" button closes it
                  toggleReplying(false);
                  setReplyTargetId(null);
                } else {
                  // Clicking a different "Reply" button moves the reply box
                  setReplyTargetId(response.id);
                  toggleReplying(true);
                }
              }}
            >
              Reply
            </Button>

            <Button
              size="xs"
              variant="outline"
              color="blue"
              onClick={() => toggleReplies(response.id)}
            >
              {expandedReplies.has(response.id)
                ? "Hide Replies ▲"
                : `View Replies ▼ (${nestedReplies[response.id]?.length || 0})`}
            </Button>
          </Group>

          {replyTargetId === response.id && replying && (
            <Stack mt="xs">
              <Textarea
                placeholder={`Replying to ${response.owner.userName}...`}
                value={replyBody}
                onChange={(e) => setReplyBody(e.currentTarget.value)}
                minRows={2}
                radius="sm"
                autosize
              />
              <Button
                size="sm"
                color="green"
                onClick={() => handleReply(response.id)}
                loading={loading}
                disabled={!replyBody.trim()}
              >
                Post Reply
              </Button>
            </Stack>
          )}

          {expandedReplies.has(response.id) && renderReplies(response.id)}
        </Card>
      ))}
    </Stack>
  );
};
