import api from "../config/axios";
import { ApiResponse } from "../constants/types";

export const useInvites = () => {
  const createInvite = async (payload: {
    discussionId: number;
    senderUserId: number;
    recipientUserId: number;
    status: string;
  }) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/invites`,
      payload
    );
    return response.data;
  };

  const getInvitesForDiscussion = async (discussionId: number) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/invites/discussion/${discussionId}`
    );
    return response.data;
  };

  const updateInviteStatus = async (id: number, status: string) => {
    const response = await api.put<ApiResponse<any>>(
      `/api/invites/${id}`,
      { status }
    );
    return response.data;
  };

  return {
    createInvite,
    getInvitesForDiscussion,
    updateInviteStatus,
  };
};
