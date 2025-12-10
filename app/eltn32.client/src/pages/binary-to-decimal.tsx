import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import ProtectedRoute from '../components/ProtectedRoute';
import { GAME_LEVELS, type BinaryGameState, type GameScore, type UserFeatureData } from '../types/game';
import { getUserFeature, updateUserFeature } from '../utils/azureApi';

function BinaryToDecimalContent({ user }: { user: User | null }) {
    // Practice mode state
    const [bits, setBits] = useState<number[]>(Array(8).fill(0));

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
        const response = await getUserFeature(user.email, 'bin2dec');
        if (response.success && response.data) {
            setUserFeatureData(response.data);
        }
        setLoadingUserData(false);
    };

    const saveScore = async (score: GameScore) => {
        if (!user?.email) return;

        const updatedData: Partial<UserFeatureData> = {
            featureName: 'bin2dec',
            highScore: Math.max(userFeatureData?.highScore || 0, score.score),
            bestLevel: Math.max(userFeatureData?.bestLevel || 0, score.level),
            totalGamesPlayed: (userFeatureData?.totalGamesPlayed || 0) + 1,
            scores: [...(userFeatureData?.scores || []), score],
            lastPlayed: new Date().toISOString(),
        };

        const response = await updateUserFeature(user.email, 'bin2dec', updatedData);
        if (response.success && response.data) {
            // Response is UserData, need to extract the feature
            const feature = response.data.features.find(f => f.featureName === 'bin2dec');
            if (feature) {
                setUserFeatureData({
                    featureName: 'bin2dec',
                    highScore: feature.recentScore,
                    bestLevel: 0,
                    totalGamesPlayed: 0,
                    scores: [],
                    lastPlayed: feature.lastUpdated,
                });
            }
        }
    };

    // Practice mode functions
    const toggleBit = (index: number) => {
        const newBits = [...bits];
        newBits[index] = newBits[index] === 0 ? 1 : 0;
        setBits(newBits);
    };

    const calculateDecimal = (): number => {
        return bits.reduce((acc, bit, index) => {
            const weight = Math.pow(2, 7 - index);
            return acc + (bit * weight);
        }, 0);
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
        setBits(numberToBinaryArray(targetNumber, level.bits));
    };

    const numberToBinaryArray = (num: number, bitCount: number): number[] => {
        const binary = num.toString(2).padStart(bitCount, '0');
        return binary.split('').map(b => parseInt(b));
    };

    const checkAnswer = () => {
        const userNum = parseInt(gameState.userAnswer);
        const isCorrect = userNum === gameState.targetNumber;

        if (isCorrect) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 1000);

            const currentLevel = GAME_LEVELS[gameState.currentLevel - 1];
            const newCorrectAnswers = gameState.correctAnswers + 1;
            const newScore = gameState.score + 100;

            // Check if level is complete
            if (gameState.currentQuestion >= currentLevel.questionsPerLevel) {
                // Level complete!
                if (gameState.currentLevel < GAME_LEVELS.length) {
                    // Move to next level
                    setShowLevelUp(true);
                    setTimeout(() => {
                        setShowLevelUp(false);
                        nextLevel(newScore, newCorrectAnswers);
                    }, 2000);
                } else {
                    // Game complete!
                    endGame(newScore, newCorrectAnswers);
                }
            } else {
                // Next question in same level
                nextQuestion(newScore, newCorrectAnswers);
            }
        } else {
            // Wrong answer - deduct points
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
        setBits(numberToBinaryArray(targetNumber, level.bits));
    };

    const nextLevel = (score: number, correctAnswers: number) => {
        const newLevel = gameState.currentLevel + 1;
        const level = GAME_LEVELS[newLevel - 1];
        const targetNumber = Math.floor(Math.random() * (level.maxValue + 1));

        setGameState({
            ...gameState,
            currentLevel: newLevel,
            currentQuestion: 1,
            score: score + 200, // Bonus for completing level
            correctAnswers,
            targetNumber,
            userAnswer: '',
        });
        setBits(numberToBinaryArray(targetNumber, level.bits));
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
        setBits(Array(8).fill(0));
    };

    const currentLevel = GAME_LEVELS[gameState.currentLevel - 1];

    return (
        <section className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Binary to Decimal</h1>
                    <p className="mt-2 text-slate-600">
                        {isGameMode
                            ? 'Convert the binary number to decimal and enter your answer!'
                            : 'Click the bits below to toggle them. Watch how the "Place Value" adds to the total.'}
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
                    {/* Progress Bar */}
                    <div className="mt-3 bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(gameState.currentQuestion / currentLevel.questionsPerLevel) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="border-2 border-dashed border-slate-200 rounded-md p-6 min-h-[200px] flex flex-col items-center gap-6">
                {/* Binary Bits Interface */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    {bits.map((bit, index) => {
                        const placeValue = Math.pow(2, bits.length - 1 - index);
                        return (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">{placeValue}</span>
                                <button
                                    onClick={() => !isGameMode && toggleBit(index)}
                                    disabled={isGameMode}
                                    className={`w-10 h-12 rounded-md border-2 font-mono text-xl transition-all duration-200 
                    ${bit === 1
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                                            : 'bg-white border-slate-300 text-slate-400'
                                        } ${!isGameMode && 'hover:border-slate-400 cursor-pointer'} ${isGameMode && 'cursor-not-allowed opacity-75'}`}
                                >
                                    {bit}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Calculation Visualization */}
                {!isGameMode && (
                    <div className="w-full max-w-2xl bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-slate-500 mb-2">CALCULATION:</p>
                        <div className="font-mono text-slate-700 break-words">
                            {bits.map((bit, index) => {
                                const weight = Math.pow(2, bits.length - 1 - index);
                                if (bit === 0) return null;
                                return (
                                    <span key={index} className="inline-block mr-2">
                                        <span className="text-blue-600 font-bold">{weight}</span>
                                        {bits.slice(index + 1).some(b => b === 1) && <span className="text-slate-400 mx-1">+</span>}
                                    </span>
                                );
                            })}
                            {calculateDecimal() === 0 && <span className="text-slate-400 italic">0 (no bits active)</span>}
                        </div>
                    </div>
                )}

                {/* Answer Section */}
                {isGameMode ? (
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <input
                                type="number"
                                value={gameState.userAnswer}
                                onChange={(e) => setGameState({ ...gameState, userAnswer: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                                placeholder="Enter decimal value"
                                className="text-4xl font-bold text-center border-4 border-blue-300 rounded-lg px-6 py-3 w-64 focus:outline-none focus:border-blue-500"
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
                            disabled={!gameState.userAnswer}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-lg transition"
                        >
                            Submit Answer
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <span className="text-slate-500 text-lg">Decimal Result: </span>
                        <span className="text-4xl font-bold text-slate-800">{calculateDecimal()}</span>
                    </div>
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

export default function BinaryToDecimal() {
    return (
        <ProtectedRoute allowGuest={true}>
            {(user) => <BinaryToDecimalContent user={user} />}
        </ProtectedRoute>
    );
}
