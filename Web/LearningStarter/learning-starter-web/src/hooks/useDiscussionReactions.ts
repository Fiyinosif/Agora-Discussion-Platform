import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createOrUpdateReaction,
  deleteReaction,
  getReactionsByDiscussion,
  type ReactionGetDto,
  type ReactionType,
} from "../config/reactions";

export function useDiscussionReactions(
  discussionId: number,
  currentUserId: number
) {
  const [items, setItems] = useState<ReactionGetDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getReactionsByDiscussion(discussionId);
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError("Failed to load reactions");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [discussionId]);

  useEffect(() => { void load(); }, [load]);

  const myReaction = useMemo(
    () => items.find((r) => r.userId === currentUserId) ?? null,
    [items, currentUserId]
  );

  const counts = useMemo(() => {
    const like = items.filter((r) => r.reactionType === "Like").length;
    const dislike = items.filter((r) => r.reactionType === "Dislike").length;
    return { like, dislike };
  }, [items]);

  const toggle = useCallback(
    async (next: ReactionType) => {
      setLoading(true);
      setError(null);
      try {
        // clicking same reaction again => remove
        if (myReaction && myReaction.reactionType === next) {
          await deleteReaction(myReaction.id);
        } else {
          await createOrUpdateReaction({
            discussionId,
            userId: currentUserId,
            reactionType: next,
          });
        }
      } catch (e) {
        setError("Failed to update reaction");
      } finally {
        await load(); // always refresh from server to stay correct
        setLoading(false);
      }
    },
    [myReaction, discussionId, currentUserId, load]
  );

  return { counts, myReaction, toggle, loading, error, refresh: load };
}
