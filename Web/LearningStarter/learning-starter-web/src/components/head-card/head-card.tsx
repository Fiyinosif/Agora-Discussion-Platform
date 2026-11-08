import { Container, Card, Group, Divider, Button, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { DiscussionGetDto } from "../../constants/types";
import React from "react";
import DiscussionReactionBar from "../DiscussionReactionBar";           // ✅ add
import { useUser } from "../../authentication/use-auth"; 



type HeadCardProps = {
  discussion?: DiscussionGetDto;
  setReplyTargetId: (id: number | null) => void;
  replyTargetId: number | null;
  replying: boolean;
  toggleReplying: (value: boolean) => void;
};

export const HeadCard: React.FC<HeadCardProps> = ({
  discussion,
  setReplyTargetId,
  replyTargetId,
  replying,
  toggleReplying,
}) => {
  const navigate = useNavigate();
  const user = useUser();
  const handleClick = () => {
    if (replyTargetId === discussion!.id) {
      // Clicking the same "Reply" button closes it
      toggleReplying(false);
      setReplyTargetId(null);
    } else {
      // Clicking a different "Reply" button moves the reply box
      setReplyTargetId(discussion!.id);
      toggleReplying(true);
    }
  };
  return (
    <>
      {/* Main Discussion */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Group justify="space-between" mb="sm">
          <Text
            fw={600}
            size="lg"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              navigate(`/userprofile/${discussion!.owner.id}`);
            }}
          >
            {discussion?.owner.userName}
          </Text>
          <Text size="xs">
            {discussion?.createdAt
              ? new Date(discussion.createdAt).toLocaleDateString()
              : ""}
          </Text>
        </Group>

        <Divider my="sm" />

        <Text size="md" mb="sm">
          {discussion?.body}
        </Text>

 {/* 👍👎 Reaction bar for the head discussion (inside the card) */}
      {discussion && (
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <DiscussionReactionBar
            discussionId={discussion.id}
            // prop is optional; remove this line if your bar reads from localStorage
            currentUserId={(user?.id as number) ?? discussion.owner?.id ?? 0}
          />
        </div>
      )}

        <Button
          size="xs"
          mt="sm"
          variant="light"
          color="blue"
          onClick={handleClick}
        >
          Reply
        </Button>
      </Card>
    </>
  );
};
