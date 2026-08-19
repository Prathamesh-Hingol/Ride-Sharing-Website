const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const authStatus = async () => {
  try {
    const response = await fetch(`${backendUrl}/auth/status`, {
      credentials: 'include', // Include cookies for session management
    });
    if (!response.ok && response.status !== 401) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return {
      isAuthenticated: data.isAuthenticated,
      user: data.user,
    };
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
};

export const postLogout = async () => {
    try {
        const response = await fetch(`${backendUrl}/auth/logout`, {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error logging out:", error);
        return null;
    }
};