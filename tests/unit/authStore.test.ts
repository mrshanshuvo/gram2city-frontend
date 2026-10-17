import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/authStore';
import { User } from '@/features/auth/types';

// Mock axios module used dynamically in authStore
vi.mock('@/api/axios', () => ({
  axiosPublic: {
    post: vi.fn(),
  },
}));

describe('useAuthStore (Zustand Authentication State)', () => {
  const mockUser: User = {
    _id: 'usr_123',
    email: 'merchant@gram2city.com',
    name: 'Merchant Rahim',
    displayName: 'Merchant Rahim',
    role: 'merchant',
    photoURL: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset store to default initial state
    useAuthStore.setState({
      user: null,
      role: null,
      isLoading: true,
    });
  });

  it('initializes with default unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('updates state synchronously via setUser, setRole, and setLoading', () => {
    const { setUser, setRole, setLoading } = useAuthStore.getState();

    setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);

    setRole('merchant');
    expect(useAuthStore.getState().role).toBe('merchant');

    setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('handles createUser successfully and stores JWT in localStorage', async () => {
    const { axiosPublic } = await import('@/api/axios');
    const mockAxiosPost = vi.mocked(axiosPublic.post);
    mockAxiosPost.mockResolvedValueOnce({
      data: {
        token: 'mock_jwt_token_register',
        user: mockUser,
        role: 'merchant',
      },
    });

    const result = await useAuthStore
      .getState()
      .createUser('merchant@gram2city.com', 'Pass1234!', 'Merchant Rahim');

    expect(mockAxiosPost).toHaveBeenCalledWith('/auth/register', {
      email: 'merchant@gram2city.com',
      password: 'Pass1234!',
      name: 'Merchant Rahim',
      photoURL: undefined,
    });

    expect(localStorage.getItem('gram2city_jwt_token')).toBe('mock_jwt_token_register');
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().role).toBe('merchant');
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(result.user).toEqual(mockUser);
  });

  it('handles signInUser successfully and updates auth credentials', async () => {
    const { axiosPublic } = await import('@/api/axios');
    const mockAxiosPost = vi.mocked(axiosPublic.post);
    mockAxiosPost.mockResolvedValueOnce({
      data: {
        token: 'mock_jwt_token_login',
        user: mockUser,
        role: 'merchant',
      },
    });

    const result = await useAuthStore.getState().signInUser('merchant@gram2city.com', 'Pass1234!');

    expect(mockAxiosPost).toHaveBeenCalledWith('/auth/login', {
      email: 'merchant@gram2city.com',
      password: 'Pass1234!',
    });

    expect(localStorage.getItem('gram2city_jwt_token')).toBe('mock_jwt_token_login');
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().role).toBe('merchant');
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(result.user).toEqual(mockUser);
  });

  it('handles signInWithGoogle and captures native session tokens', async () => {
    const { axiosPublic } = await import('@/api/axios');
    const mockAxiosPost = vi.mocked(axiosPublic.post);
    mockAxiosPost.mockResolvedValueOnce({
      data: {
        token: 'mock_jwt_token_google',
        user: mockUser,
        role: 'merchant',
      },
    });

    const googlePayload = { credential: 'google_oauth_credential_string' };
    const result = await useAuthStore.getState().signInWithGoogle(googlePayload);

    expect(mockAxiosPost).toHaveBeenCalledWith('/auth/google', googlePayload);
    expect(localStorage.getItem('gram2city_jwt_token')).toBe('mock_jwt_token_google');
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(result.token).toBe('mock_jwt_token_google');
  });

  it('optimistically updates user profile info in memory', async () => {
    useAuthStore.setState({ user: mockUser, role: 'merchant', isLoading: false });

    await useAuthStore.getState().updateUserProfile({
      displayName: 'Rahim Updated',
      photoURL: 'https://example.com/new-avatar.png',
    });

    const updated = useAuthStore.getState().user;
    expect(updated?.displayName).toBe('Rahim Updated');
    expect(updated?.name).toBe('Rahim Updated');
    expect(updated?.photoURL).toBe('https://example.com/new-avatar.png');
    expect(updated?.email).toBe('merchant@gram2city.com'); // Preserves unchanged fields
  });

  it('clears state, deletes localStorage token, and calls logout API on logout', async () => {
    const { axiosPublic } = await import('@/api/axios');
    const mockAxiosPost = vi.mocked(axiosPublic.post);
    mockAxiosPost.mockResolvedValueOnce({ data: { success: true } });

    localStorage.setItem('gram2city_jwt_token', 'token_to_remove');
    useAuthStore.setState({ user: mockUser, role: 'merchant', isLoading: false });

    await useAuthStore.getState().logout();

    expect(localStorage.getItem('gram2city_jwt_token')).toBeNull();
    expect(mockAxiosPost).toHaveBeenCalledWith('/auth/logout');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().role).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
