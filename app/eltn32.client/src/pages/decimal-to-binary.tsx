import { useState, useMemo, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { User } from 'firebase/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import { GAME_LEVELS, type BinaryGameState, type GameScore, type UserFeatureData } from '../types/game';
import { getUserFeature, updateUserFeature } from '../utils/azureApi';

// Define the shape of our step object so TypeScript knows what "steps" contains
interface CalculationStep {
    weight: number;
    bit: 0 | 1;
    fits: boolean;
    remaining: number;
    explanation: string;
}

function DecimalToBinaryContent({ user }: { user: User | null }) {
    // Practice mode state
    const [decimalStr, setDecimalStr] = useState<string>('156');
    const weights: number[] = [128, 64, 32, 16, 8, 4, 2, 1];

    // Game mode state
    const [isGameMode, setIsGameMode] = useState(false);
    const [gameState, setGameState] = useState<BinaryGameState>({
        currentLevel: 1,
        currentQuestion: 1,
        score: 0,
        correctAnswers: 0,
        startTime: Date.now(),
        isGameMode: false,
        targetNumber: 0,
        userAnswer: '',
    });

    // User data state
    const [userFeatureData, setUserFeatureData] = useState<UserFeatureData | null>(null);
    const [loadingUserData, setLoadingUserData] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    // Load user data on mount if authenticated
    useEffect(() => {
        if (user?.email) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = async () => {
        if (!user?.email) return;

        setLoadingUserData(true);
        const response = await getUserFeature(user.email, 'dec2bin');
        if (response.success && response.data) {
            setUserFeatureData(response.data);
        }
        setLoadingUserData(false);
    };

    const saveScore = async (score: GameScore) => {
        if (!user?.email) return;

        const updatedData: Partial<UserFeatureData> = {
            featureName: 'dec2bin',
            highScore: Math.max(userFeatureData?.highScore || 0, score.score),
            bestLevel: Math.max(userFeatureData?.bestLevel || 0, score.level),
            totalGamesPlayed: (userFeatureData?.totalGamesPlayed || 0) + 1,
            scores: [...(userFeatureData?.scores || []), score],
            lastPlayed: new Date().toISOString(),
        };

        const response = await updateUserFeature(user.email, 'dec2bin', updatedData);
        if (response.success && response.data) {
            const feature = response.data.features.find(f => f.featureName === 'dec2bin');
            if (feature) {
                setUserFeatureData({
                    featureName: 'dec2bin',
                    highScore: feature.recentScore,
                    bestLevel: 0,
                    totalGamesPlayed: 0,
                    scores: [],
                    lastPlayed: feature.lastUpdated,
                });
            }
        }
    };

    // Practice mode calculation
    const calculationSteps = useMemo(() => {
        let num = parseInt(decimalStr, 10);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 255) num = 255;

        const steps: CalculationStep[] = [];
        let currentTotal = num;

        weights.forEach((weight) => {
            if (currentTotal >= weight) {
                steps.push({
                    weight,
                    bit: 1,
                    fits: true,
                    remaining: currentTotal - weight,
                    explanation: `${weight} fits into ${currentTotal}`
                });
                currentTotal -= weight;
            } else {
                steps.push({
                    weight,
                    bit: 0,
                    fits: false,
                    remaining: currentTotal,
                    explanation: `${weight} does not fit into ${currentTotal}`
                });
            }
        });
        return steps;
    }, [decimalStr]);

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setDecimalStr(val);
    };

    // Game mode functions
    const startGameMode = () => {
        const level = GAME_LEVELS[0];
        const targetNumber = Math.floor(Math.random() * (level.maxValue + 1));

        setGameState({
            currentLevel: 1,
            currentQuestion: 1,
            score: 0,
            correctAnswers: 0,
            startTime: Date.now(),
            isGameMode: true,
            targetNumber,
            userAnswer: '',
        });
        setIsGameMode(true);
    };

    const numberToBinaryString = (num: number, bitCount: number): string => {
        return num.toString(2).padStart(bitCount, '0');
    };

    const checkAnswer = () => {
        const correctBinary = numberToBinaryString(gameState.targetNumber, GAME_LEVELS[gameState.currentLevel - 1].bits);
        const userBinary = gameState.userAnswer.replace(/\s/g, ''); // Remove spaces
        const isCorrect = userBinary === correctBinary;

        if (isCorrect) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 1000);

            const currentLevel = GAME_LEVELS[gameState.currentLevel - 1];
            const newCorrectAnswers = gameState.correctAnswers + 1;
            const newScore = gameState.score + 100;

            if (gameState.currentQuestion >= currentLevel.questionsPerLevel) {
                if (gameState.currentLevel < GAME_LEVELS.length) {
                    setShowLevelUp(true);
                    setTimeout(() => {
                        setShowLevelUp(false);
                        nextLevel(newScore, newCorrectAnswers);
                    }, 2000);
                } else {
                    endGame(newScore, newCorrectAnswers);
                }
            } else {
                nextQuestion(newScore, newCorrectAnswers);
            }
        } else {
            const newScore = Math.max(0, gameState.score - 20);
            setGameState({ ...gameState, score: newScore, userAnswer: '' });
        }
    };

    const nextQuestion = (score: number, correctAnswers: number) => {
        const level = GAME_LEVELS[gameState.currentLevel - 1];
        const targetNumber = Math.floor(Math.random() * (level.maxValue + 1));

        setGameState({
            ...gameState,
            currentQuestion: gameState.currentQuestion + 1,
            score,
            correctAnswers,
            targetNumber,
            userAnswer: '',
        });
    };

    const nextLevel = (score: number, correctAnswers: number) => {
        const newLevel = gameState.currentLevel + 1;
        const level = GAME_LEVELS[newLevel - 1];
        const targetNumber = Math.floor(Math.random() * (level.maxValue + 1));

        setGameState({
            ...gameState,
            currentLevel: newLevel,
            currentQuestion: 1,
            score: score + 200,
            correctAnswers,
            targetNumber,
            userAnswer: '',
        });
    };

    const endGame = async (finalScore: number, correctAnswers: number) => {
        const gameScore: GameScore = {
            level: gameState.currentLevel,
            score: finalScore,
            correctAnswers,
            totalQuestions: gameState.currentQuestion,
            timeSpent: Math.floor((Date.now() - gameState.startTime) / 1000),
            completedAt: new Date().toISOString(),
        };

        if (user) {
            await saveScore(gameScore);
        }

        alert(`Game Complete! Final Score: ${finalScore}\nCorrect Answers: ${correctAnswers}`);
        setIsGameMode(false);
    };

    const exitGameMode = () => {
        setIsGameMode(false);
        setDecimalStr('156');
    };

    const currentLevel = GAME_LEVELS[gameState.currentLevel - 1];

    return (
        <section className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Decimal to Binary</h1>
                    <p className="mt-2 text-slate-600">
                        {isGameMode
                            ? 'Convert the decimal number to binary and enter your answer!'
                            : 'Enter a decimal number (0-255). See how we "fit" powers of 2 into it.'}
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => !isGameMode && setIsGameMode(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${!isGameMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                    >
                        Practice Mode
                    </button>
                    <button
                        onClick={startGameMode}
                        className={`px-4 py-2 rounded-lg font-medium transition ${isGameMode
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                    >
                        Game Mode
                    </button>
                </div>
            </div>

            {/* Guest Banner */}
            {!user && isGameMode && (
                <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <p className="text-amber-800 font-medium">
                        🔒 Sign in to save your progress and compete on the leaderboard!
                    </p>
                </div>
            )}

            {/* Game Stats */}
            {isGameMode && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-6">
                            <div>
                                <span className="text-sm text-slate-600">Level</span>
                                <p className="text-2xl font-bold text-blue-600">{gameState.currentLevel}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Question</span>
                                <p className="text-2xl font-bold text-purple-600">
                                    {gameState.currentQuestion}/{currentLevel.questionsPerLevel}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Score</span>
                                <p className="text-2xl font-bold text-green-600">{gameState.score}</p>
                            </div>
                            {user && userFeatureData && (
                                <div>
                                    <span className="text-sm text-slate-600">High Score</span>
                                    <p className="text-2xl font-bold text-orange-600">{userFeatureData.highScore}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={exitGameMode}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        >
                            Exit Game
                        </button>
                    </div>
                    <div className="mt-3 bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(gameState.currentQuestion / currentLevel.questionsPerLevel) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="border-2 border-dashed border-slate-200 rounded-md p-6 min-h-[200px] flex flex-col gap-6">
                {isGameMode ? (
                    /* Game Mode UI */
                    <>
                        <div className="text-center space-y-4">
                            <div className="bg-slate-800 text-white p-6 rounded-lg">
                                <span className="text-sm text-slate-400">Convert this decimal to binary:</span>
                                <div className="text-6xl font-bold mt-2">{gameState.targetNumber}</div>
                                <div className="text-xs text-slate-500 mt-2">
                                    ({currentLevel.bits}-bit binary)
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={gameState.userAnswer}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^01]/g, '');
                                        setGameState({ ...gameState, userAnswer: val });
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                                    placeholder={`Enter ${currentLevel.bits}-bit binary`}
                                    maxLength={currentLevel.bits}
                                    className="text-4xl font-mono font-bold text-center border-4 border-blue-300 rounded-lg px-6 py-3 w-full focus:outline-none focus:border-blue-500"
                                    autoFocus
                                />
                                {showCelebration && (
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce">
                                        ✨
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={checkAnswer}
                                disabled={!gameState.userAnswer || gameState.userAnswer.length !== currentLevel.bits}
                                className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-lg transition"
                            >
                                Submit Answer
                            </button>
                        </div>
                    </>
                ) : (
                    /* Practice Mode UI */
                    <>
                        <div className="flex items-center gap-4">
                            <label className="font-semibold text-slate-700">Decimal Input:</label>
                            <input
                                type="text"
                                value={decimalStr}
                                onChange={handleInput}
                                maxLength={3}
                                className="border border-slate-300 rounded px-3 py-2 text-lg font-mono w-24 focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-xs text-slate-400">(Max 255 for 8-bit visualization)</span>
                        </div>

                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-slate-100 p-2 font-semibold text-xs text-slate-600 uppercase tracking-wider">
                                <div>Place Value</div>
                                <div>Logic</div>
                                <div>Bit</div>
                                <div>Remaining</div>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {calculationSteps.map((step) => (
                                    <div key={step.weight} className={`grid grid-cols-[1fr_1fr_1fr_1fr] p-2 text-sm ${step.fits ? 'bg-blue-50/50' : 'bg-white'}`}>
                                        <div className="font-bold text-slate-700">{step.weight}</div>
                                        <div className={`text-xs flex items-center ${step.fits ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
                                            {step.explanation}
                                        </div>
                                        <div className="font-mono font-bold text-lg">
                                            <span className={step.bit === 1 ? 'text-blue-600' : 'text-slate-300'}>
                                                {step.bit}
                                            </span>
                                        </div>
                                        <div className="text-slate-500 font-mono">{step.remaining}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-800 text-white p-4 rounded-md shadow-sm">
                            <span className="font-medium text-slate-300">Binary Result:</span>
                            <div className="font-mono text-2xl tracking-[0.2em]">
                                {calculationSteps.map(s => s.bit).join('')}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Level Up Animation */}
            {showLevelUp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-12 text-center animate-bounce">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-4xl font-bold text-blue-600 mb-2">Level Up!</h2>
                        <p className="text-2xl text-slate-600">Level {gameState.currentLevel + 1}</p>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function DecimalToBinary() {
    return (
        <ProtectedRoute allowGuest={true}>
            {(user) => <DecimalToBinaryContent user={user} />}
        </ProtectedRoute>
    );
}
