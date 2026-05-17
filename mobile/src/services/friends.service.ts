/**
 * Friends Service
 * Search users and manage friend requests / friendships.
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { ApiResponse, FriendUser, PendingFriendRequest } from '../types';

class FriendsService {
  async search(q: string): Promise<ApiResponse<FriendUser[]>> {
    return apiService.get<FriendUser[]>(`${API_ENDPOINTS.FRIENDS.SEARCH}?q=${encodeURIComponent(q)}`);
  }

  async list(): Promise<ApiResponse<FriendUser[]>> {
    return apiService.get<FriendUser[]>(API_ENDPOINTS.FRIENDS.LIST);
  }

  async pending(): Promise<ApiResponse<PendingFriendRequest[]>> {
    return apiService.get<PendingFriendRequest[]>(API_ENDPOINTS.FRIENDS.PENDING);
  }

  async sendRequest(userId: number): Promise<ApiResponse<{ status: string }>> {
    return apiService.post<{ status: string }>(API_ENDPOINTS.FRIENDS.REQUEST, { user_id: userId });
  }

  async accept(friendshipId: number): Promise<ApiResponse<{ status: string }>> {
    return apiService.post<{ status: string }>(API_ENDPOINTS.FRIENDS.ACCEPT(friendshipId));
  }
}

export default new FriendsService();
