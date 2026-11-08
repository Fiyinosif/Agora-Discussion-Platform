import api from "./axios";

export type ReactionType = "Like" | "Dislike";

export interface ReactionGetDto {
  id: number;
  discussionId: number;
  userId: number;
  userName?: string;
  reactionType: ReactionType | string;
}

export interface ReactionCreateDto {
  discussionId: number;
  userId: number;
  reactionType: ReactionType;
}

export async function getReactionsByDiscussion(discussionId: number) {
  const { data } = await api.get<{ data: ReactionGetDto[] }>(
    `/api/reactions/discussion/${discussionId}`
  );
  return data.data ?? [];
}

export async function createOrUpdateReaction(input: ReactionCreateDto) {
  const { data } = await api.post<{ data: ReactionGetDto }>(
    `/api/reactions`,
    input
  );
  return data.data;
}

export async function deleteReaction(id: number) {
  await api.delete(`/api/reactions/${id}`);
}
