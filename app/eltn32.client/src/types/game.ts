// Game-related type definitions

export interface GameLevel {
    level: number;
    bits: number;
    maxValue: number;
    questionsPerLevel: number;
}

export interface GameScore {
    level: number;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number; // in seconds
    completedAt: string; // ISO timestamp
}

export interface BinaryGameState {
    currentLevel: number;
    currentQuestion: number;
    score: number;
    correctAnswers: number;
    startTime: number;
    isGameMode: boolean;
    targetNumber: number;
    userAnswer: string;
}

// Azure Functions API Types
export interface UserFeature {
    featureName: string;
    recentScore: number;
    lastUpdated: string;
}

export interface UserData {
    emailAddress: string;
    username: string;
    features: UserFeature[];
    createdAt: string;
    lastUpdated: string;
}

// Local state for game feature data
export interface UserFeatureData {
    featureName: string;
    highScore: number;
    bestLevel: number;
    totalGamesPlayed: number;
    scores: GameScore[];
    lastPlayed?: string;
}

export const GAME_LEVELS: GameLevel[] = [
    { level: 1, bits: 2, maxValue: 3, questionsPerLevel: 5 },
    { level: 2, bits: 3, maxValue: 7, questionsPerLevel: 5 },
    { level: 3, bits: 4, maxValue: 15, questionsPerLevel: 5 },
    { level: 4, bits: 5, maxValue: 31, questionsPerLevel: 5 },
    { level: 5, bits: 6, maxValue: 63, questionsPerLevel: 5 },
    { level: 6, bits: 7, maxValue: 127, questionsPerLevel: 5 },
    { level: 7, bits: 8, maxValue: 255, questionsPerLevel: 5 },
];

