import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { usersService } from './users';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export const storageService = {
  async uploadProfilePhoto(file: File) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');
    
    try {
      // Create unique path for profile photo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const path = `users/${userProfile.uid}/profile/${fileName}`;
      const storageRef = ref(storage, path);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const url = await getDownloadURL(storageRef);
      if (!url) {
        throw new Error('Failed to get download URL');
      }
      return url;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить фото профиля",
        variant: "destructive",
      });
      throw error;
    }
  },

  async uploadQR(file: File) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const userProfile = await usersService.getCurrentUserProfile();
    if (!userProfile) throw new Error('User profile not found');
    
    try {
      // Create path for QR code in user's folder
      const timestamp = Date.now();
      const path = `users/${userProfile.uid}/uploads/${timestamp}.jpg`;
      const storageRef = ref(storage, path);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading QR:', error);
      throw error;
    }
  }
};