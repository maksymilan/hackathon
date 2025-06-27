// src/contexts/UserContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { ReactNode } from 'react'; // 使用仅类型导入
import { getProfile } from '../services/api';
import type { ProfileData } from '../types'; // 从正确的文件导入类型

// 定义 Context 中共享的数据结构
interface UserContextType {
  profile: ProfileData | null;
  isLoading: boolean;
  refreshProfile: () => void; // 提供一个刷新数据的方法
}

// 创建 Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// 创建一个 Provider 组件
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to fetch profile in context:", error);
      setProfile(null); // 出错时清空
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const value = { profile, isLoading, refreshProfile: fetchProfile };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 创建一个自定义 Hook，方便子组件使用
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 