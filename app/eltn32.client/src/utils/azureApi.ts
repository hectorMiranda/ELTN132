// Azure Functions API client

import type { UserFeatureData, UserData, UserFeature } from '../types/game';

const AZURE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_AZURE_FUNCTIONS_URL || 'http://localhost:7226';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Get user's complete data from Azure Functions
 */
export async function getUserData(email: string): Promise<ApiResponse<UserData>> {
    try {
        const response = await fetch(
            `${AZURE_FUNCTIONS_URL}/api/users/${encodeURIComponent(email)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                // User doesn't exist yet, return empty structure
                return {
                    success: true,
                    data: {
                        emailAddress: email,
                        username: '',
                        features: [],
                        createdAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                    },
                };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching user data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get user's feature data from Azure Functions
 * Converts API format to local UserFeatureData format
 */
export async function getUserFeature(
    email: string,
    featureName: string
): Promise<ApiResponse<UserFeatureData>> {
    try {
        const userDataResponse = await getUserData(email);

        if (!userDataResponse.success || !userDataResponse.data) {
            return {
                success: false,
                error: userDataResponse.error || 'Failed to fetch user data',
            };
        }

        const userData = userDataResponse.data;
        const feature = userData.features.find(f => f.featureName === featureName);

        if (!feature) {
            // Feature doesn't exist yet, return empty data
            return {
                success: true,
                data: {
                    featureName,
                    highScore: 0,
                    bestLevel: 0,
                    totalGamesPlayed: 0,
                    scores: [],
                },
            };
        }

        // Convert API format to local format
        // Note: API only stores recentScore, so we use it as highScore
        return {
            success: true,
            data: {
                featureName: feature.featureName,
                highScore: feature.recentScore,
                bestLevel: 0, // Not stored in API yet
                totalGamesPlayed: 0, // Not stored in API yet
                scores: [], // Not stored in API yet
                lastPlayed: feature.lastUpdated,
            },
        };
    } catch (error) {
        console.error('Error fetching user feature:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Update user's feature data in Azure Functions
 */
export async function updateUserFeature(
    email: string,
    featureName: string,
    featureData: Partial<UserFeatureData>
): Promise<ApiResponse<UserData>> {
    try {
        // Get current user data first
        const currentDataResponse = await getUserData(email);

        if (!currentDataResponse.success) {
            throw new Error(currentDataResponse.error || 'Failed to fetch current user data');
        }

        const currentData = currentDataResponse.data!;

        // Find existing feature or create new one
        const existingFeatureIndex = currentData.features.findIndex(
            f => f.featureName === featureName
        );

        const updatedFeature: UserFeature = {
            featureName,
            recentScore: featureData.highScore || 0,
            lastUpdated: new Date().toISOString(),
        };

        let updatedFeatures: UserFeature[];
        if (existingFeatureIndex >= 0) {
            // Update existing feature
            updatedFeatures = [...currentData.features];
            updatedFeatures[existingFeatureIndex] = updatedFeature;
        } else {
            // Add new feature
            updatedFeatures = [...currentData.features, updatedFeature];
        }

        // Send update to API
        const response = await fetch(`${AZURE_FUNCTIONS_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailAddress: email,
                username: currentData.username || 'User',
                features: updatedFeatures,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error updating user feature:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

