import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { UserProfile } from '../types/ProfileTypes';

const PROFILE_CACHE_KEY = '@user_profile_data';

export const ProfileService = {
  /**
   * Get user profile from API with local caching
   */
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      // Try to get cached version first for speed
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        // Return cached but still fetch fresh in background (stale-while-revalidate strategy)
        // For simplicity in this implementation we just continue to fetch
      }

      const response = await api.get('/auth/me');
      
      if (response.data && response.data.user) {
        const profile: UserProfile = response.data.user;
        // Cache the fresh result
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to cache if network fails
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  /**
   * Update user profile information
   */
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.put('/auth/me', data);
      
      if (response.data && response.data.user) {
        const updatedProfile = response.data.user;
        // Update cache
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));
        
        // Also update the global 'user' object in auth storage if needed
        const authUserStr = await AsyncStorage.getItem('user');
        if (authUserStr) {
            // Update the stored user object with new profile data
            // We use the returned updatedProfile to ensure we have the server-side confirmed data
            const curUser = JSON.parse(authUserStr);
            const newAuthUser = { ...curUser, ...updatedProfile };
            await AsyncStorage.setItem('user', JSON.stringify(newAuthUser));
        }
        
        return updatedProfile;
      }
      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Upload avatar image
   * Note: This usually requires a specific endpoint handling multipart/form-data
   */
  uploadAvatar: async (uri: string): Promise<string> => {
    try {
      const formData = new FormData();
      
      // Determine file type from extension
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore - ReactNative FormData expects this structure
      formData.append('avatar', { uri, name: filename, type });

      const response = await api.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.avatarUrl) {
         // Update cache with new avatar
         const profile = await ProfileService.getProfile();
         if (profile) {
             profile.avatarUrl = response.data.avatarUrl;
             await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
         }
         return response.data.avatarUrl;
      }
      
      throw new Error('Failed to upload avatar');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
  
  /**
   * Change user password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
      try {
          await api.post('/auth/change-password', {
              currentPassword,
              newPassword
          });
          return true;
      } catch (error) {
          console.error('Error changing password:', error);
          throw error;
      }
  }
};
