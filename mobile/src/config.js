import Constants from "expo-constants";

const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;

export const API_BASE_URL = configuredBaseUrl || "http://localhost:3000/api";
