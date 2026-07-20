import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export type UploadKind = 'tournament-banner' | 'avatar' | 'rules';
export type UploadAsset = { uri: string; name?: string; fileName?: string | null; mimeType?: string | null; type?: string; file?: Blob };

export async function uploadFile(kind: UploadKind, asset: UploadAsset) {
  const token = await AsyncStorage.getItem('courtmate_jwt_token');
  if (!token || token === 'mock_google_jwt_token') throw new Error('Vui lòng đăng nhập bằng tài khoản CourtMate để tải file');
  const form = new FormData();
  if (asset.file) {
    form.append('file', asset.file, asset.name || asset.fileName || 'upload');
  } else {
    form.append('file', {
      uri: asset.uri,
      name: asset.name || asset.fileName || `upload-${Date.now()}`,
      type: asset.mimeType || asset.type || 'application/octet-stream',
    } as any);
  }
  const response = await fetch(`${API_URL}/uploads/${kind}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Không thể tải file lên');
  }
  return response.json() as Promise<{ url: string; filename: string; mimeType: string; size: number }>;
}
