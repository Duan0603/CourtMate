export const apiClient = {
  get: async <T>(url: string, headers?: Record<string, string>): Promise<T> => {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  },

  post: async <T>(url: string, body: any, headers?: Record<string, string>): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  },

  patch: async <T>(url: string, body: any, headers?: Record<string, string>): Promise<T> => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  },
};
