import React, { useMemo } from "react";
import { ActionIcon, Badge, Group, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import { useDiscussionReactions } from "../hooks/useDiscussionReactions";

type Props = {
  discussionId: number;
  currentUserId?: number; 
};

export default function DiscussionReactionBar({ discussionId, currentUserId }: Props) {
  const effectiveUserId = useMemo(() => {
    if (typeof currentUserId === "number" && currentUserId > 0) return currentUserId;
    const raw = localStorage.getItem("userId");
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [currentUserId]);

  const { counts, myReaction, toggle, loading } =
    useDiscussionReactions(discussionId, effectiveUserId);

  const activeLike = myReaction?.reactionType === "Like";
  const activeDislike = myReaction?.reactionType === "Dislike";

  return (
    <Group gap="xs" align="center">
      <Tooltip label="Like">
        <ActionIcon
          variant={activeLike ? "filled" : "light"}
          radius="xl"
          loading={loading}
          onClick={() => toggle("Like")}
          aria-label="Like"
          disabled={!effectiveUserId}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
        </ActionIcon>
      </Tooltip>
      <Badge variant="light">{counts.like}</Badge>

      <Tooltip label="Dislike">
        <ActionIcon
          variant={activeDislike ? "filled" : "light"}
          radius="xl"
          loading={loading}
          onClick={() => toggle("Dislike")}
          aria-label="Dislike"
          disabled={!effectiveUserId}
        >
          <FontAwesomeIcon icon={faThumbsDown} />
        </ActionIcon>
      </Tooltip>
      <Badge variant="light">{counts.dislike}</Badge>
    </Group>
  );
}
