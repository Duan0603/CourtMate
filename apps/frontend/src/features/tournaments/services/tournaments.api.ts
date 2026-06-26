import { CreateTournamentDto } from '@courtmate/shared';
// Lấy BACKEND_URL từ biến môi trường hoặc config (MVP dùng localhost/LAN IP)
const BACKEND_URL = 'http://10.0.2.2:3000'; // Dành cho Android Emulator, thay đổi tuỳ theo device thật

export const createTournament = async (
  data: CreateTournamentDto,
  rulesFile?: { uri: string; name: string; type: string }
) => {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('sport', data.sport);
  formData.append('time', data.time);
  formData.append('location', data.location);
  formData.append('city', data.city);
  formData.append('categories', JSON.stringify(data.categories));

  if (data.rulesText) {
    formData.append('rulesText', data.rulesText);
  }

  if (rulesFile) {
    formData.append('rulesFile', {
      uri: rulesFile.uri,
      name: rulesFile.name,
      type: rulesFile.type,
    } as any);
  }

  const response = await fetch(`${BACKEND_URL}/tournaments`, {
    method: 'POST',
    body: formData,
    headers: {
      // Fetch automatically sets Content-Type to multipart/form-data with boundary when passing FormData
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create tournament');
  }

  return response.json();
};
