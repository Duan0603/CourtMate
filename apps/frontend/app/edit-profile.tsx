import { useEffect } from 'react';
import { router } from 'expo-router';

export default function EditProfileRedirect() {
  useEffect(() => {
    router.replace('/(tabs)/profile?view=edit-profile');
  }, []);

  return null;
}
