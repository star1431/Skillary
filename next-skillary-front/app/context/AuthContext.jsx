import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers, addCreator } from '../utils/mockData';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Convert createdAt string back to Date object
        if (parsedUser.createdAt) {
          parsedUser.createdAt = new Date(parsedUser.createdAt);
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // Mock authentication
    // Test account: test@test.com / 1234
    if (email === 'test@test.com' && password === '1234') {
      const testUser = mockUsers.find((u) => u.email === 'test@test.com');
      if (testUser) {
        const userToStore = {
          ...testUser,
          createdAt: testUser.createdAt.toISOString(),
        };
        setUser(testUser);
        localStorage.setItem('user', JSON.stringify(userToStore));
        return;
      }
    }
    
    const foundUser = mockUsers.find((u) => u.email === email);
    if (foundUser) {
      const userToStore = {
        ...foundUser,
        createdAt: foundUser.createdAt.toISOString(),
      };
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(userToStore));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const signup = async (email, password, nickname) => {
    // Mock signup
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      nickname,
      role: 'USER',
      createdAt: new Date(),
    };
    const userToStore = {
      ...newUser,
      createdAt: newUser.createdAt.toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  const toggleRole = () => {
    if (!user) return;
    
    const newRole = user.role === 'USER' ? 'CREATOR' : 'USER';
    const updatedUser = {
      ...user,
      role: newRole,
    };
    const userToStore = {
      ...updatedUser,
      createdAt: updatedUser.createdAt instanceof Date 
        ? updatedUser.createdAt.toISOString() 
        : updatedUser.createdAt,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  const createCreator = async (displayName, bio) => {
    if (!user) throw new Error('로그인이 필요합니다.');
    
    // 크리에이터 프로필 생성
    const newCreator = addCreator({
      id: `creator-profile-${user.id}`,
      userId: user.id,
      displayName,
      profileImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
      bio,
      category: '기타', // 기본 카테고리로 설정 (크리에이터는 카테고리가 필요없지만 mockData 구조 유지)
      subscriberCount: 0,
      status: 'APPROVED',
      createdAt: new Date(),
    });

    // 사용자 역할을 CREATOR로 변경
    const updatedUser = {
      ...user,
      role: 'CREATOR',
    };
    const userToStore = {
      ...updatedUser,
      createdAt: updatedUser.createdAt instanceof Date 
        ? updatedUser.createdAt.toISOString() 
        : updatedUser.createdAt,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(userToStore));

    return newCreator;
  };

  const updateUser = async (nickname, email) => {
    if (!user) throw new Error('로그인이 필요합니다.');
    
    const updatedUser = {
      ...user,
      nickname: nickname || user.nickname,
      email: email || user.email,
    };
    const userToStore = {
      ...updatedUser,
      createdAt: updatedUser.createdAt instanceof Date 
        ? updatedUser.createdAt.toISOString() 
        : updatedUser.createdAt,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, toggleRole, createCreator, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

