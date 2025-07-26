export interface MockUser {
  id: string;
  name: string;
  email: string;
  languageToLearn: string;
  nativeLanguage: string;
  seiAddress?: string;
  ethAddress?: string;
  tokenBalance: number;
  currentStreak: number;
  highestStreak: number;
  totalYapEarned: number;
  completedLessons: number[];
}

export const mockUser: MockUser = {
  id: 'did:privy:mockuser123',
  name: 'Test User',
  email: 'test@example.com',
  languageToLearn: 'Spanish',
  nativeLanguage: 'English',
  seiAddress: 'sei1mockaddress123',
  ethAddress: '0x1234567890123456789012345678901234567890',
  tokenBalance: 50,
  currentStreak: 7,
  highestStreak: 15,
  totalYapEarned: 100,
  completedLessons: [1, 2, 3, 4, 5]
};

export const mockUserProfile = {
  wordsLearned: 150,
  sentencesLearned: 45,
  currentLesson: 3,
  lessonProgress: {
    completedLessons: 8,
    totalLessons: 12
  }
}; 