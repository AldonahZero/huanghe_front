/**
 * Lightweight API client for Huanghe backend.
 * - Uses fetch
 * - Supports setting a JWT token via setAuthToken
 * - Reads base URL from NEXT_PUBLIC_API_URL or defaults to http://localhost:5001
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
        ...(init.headers as Record<string, string> | undefined),
    };

    if (!(headers["Content-Type"])) {
        headers["Content-Type"] = "application/json";
    }

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
    });

    const text = await res.text();
    let data: unknown = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // non-json response
        data = text;
    }

    if (!res.ok) {
        const dataObj = data && typeof data === "object" && data !== null ? (data as Record<string, unknown>) : undefined;
        const message = (dataObj && (dataObj["message"] ?? dataObj["error"])) ?? res.statusText ?? "Request failed";
        const err: { message: string; status: number; payload?: unknown } = {
            message: String(message),
            status: res.status,
            payload: data,
        };
        throw err;
    }

    return data as T;
}

// Auth
import type {
    AuthResponse as TAuthResponse,
    TemplatesList as TTemplatesList,
    AnalysisResult as TAnalysisResult,
    ProjectsList as TProjectsList,
    Project as TProject,
    PriceHistoryItem as TPriceHistoryItem,
} from "@/types/api";

export async function login(values: { username: string; password: string }): Promise<TAuthResponse> {
    const data = await request<TAuthResponse>(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify(values),
    });
    return data;
}

export async function register(values: { username: string; password: string; invite_code?: string }) {
    const data = await request(`/api/auth/register`, {
        method: "POST",
        body: JSON.stringify(values),
    });
    return data;
}

// Templates
export async function getTemplates(): Promise<TTemplatesList> {
    return request<TTemplatesList>(`/api/templates`);
}

// Latest crawl data
export async function getLatest(templateId: number, data_type?: string): Promise<Record<string, any>> {
    const qs = data_type ? `?data_type=${encodeURIComponent(data_type)}` : "";
    return request<Record<string, any>>(`/api/latest/${templateId}${qs}`);
}

// Analysis (protected)
export async function getAnalysis(templateId: number, analysis_type?: string): Promise<TAnalysisResult> {
    const qs = analysis_type ? `?analysis_type=${encodeURIComponent(analysis_type)}` : "";
    return request<TAnalysisResult>(`/api/analysis/${templateId}${qs}`);
}

export async function getAnalysisTypes(templateId: number): Promise<{ template_id: number; analysis_types: string[]; count: number }> {
    return request(`/api/analysis/${templateId}/types`);
}

// Price history
export async function getPriceHistory(templateId: number, data_type?: string, limit?: number): Promise<{ template_id?: number; data_type?: string; count?: number; history?: TPriceHistoryItem[] }> {
    const params = new URLSearchParams();
    if (data_type) params.set("data_type", data_type);
    if (limit) params.set("limit", String(limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request(`/api/price-history/${templateId}${qs}`);
}

// Projects
export async function getProjects(): Promise<TProjectsList> {
    return request<TProjectsList>(`/api/projects`);
}

export async function getProject(projectId: number): Promise<TProject> {
    return request<TProject>(`/api/projects/${projectId}`);
}

export async function createProject(payload: { name: string; template_id: number; member_level_required?: string }): Promise<{ project?: TProject }> {
    return request(`/api/projects`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateProject(projectId: number, payload: Partial<TProject>): Promise<TProject> {
    return request<TProject>(`/api/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteProject(projectId: number): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/api/projects/${projectId}`, {
        method: "DELETE",
    });
}

// Project Analysis
export interface ProjectAnalysisResponse {
    project: {
        id: number;
        name: string;
        template_id: number;
        is_active: boolean;
        created_at: string | null;
        item: {
            market_name: string;
            weapon: string;
            exterior: string;
            icon_url: string;
        } | null;
    };
    analysis: {
        timeRange: number;
        timestamp: string;
        topBuyers: Array<{
            userId: string;
            userName: string;
            avatarUrl: string;
            orderCount: number;
            position: number;
            timestamp: number;
        }>;
        buyerPositionDistribution: Array<{
            userId: string;
            userName: string;
            positions: Array<{
                position: number;
                count: number;
            }>;
            totalOrders: number;
        }>;
        topSellers: Array<{
            userId: string;
            userName: string;
            userNickName?: string;
            avatarUrl: string;
            listingCount: number;
            timestamp: number;
        }>;
        topBuyers_transactions: any[];
        topSellers_transactions: any[];
        activePairs: any[];
    };
    statistics: {
        totalBuyOrders: number;
        totalSellListings: number;
        totalTransactions: number;
        activeBuyers: number;
        activeSellers: number;
        avgPrice: number;
        maxPrice: number;
        minPrice: number;
        priceChange24h: number;
    };
}

export async function getProjectAnalysis(projectId: number, timeRange: number = 24): Promise<ProjectAnalysisResponse> {
    return request<ProjectAnalysisResponse>(`/api/projects/${projectId}/analysis?timeRange=${timeRange}`);
}

// User Profile
export interface UserProfileData {
    id: number;
    username: string;
    user_nickname?: string;
    email?: string;
    role: string;
    member_type?: string;
    member_level?: string;
    avatar_url?: string;
    team_id?: number;
    team_name?: string;
    invited_by_user_id?: number;
    invited_by_username?: string;
    project_quota: number;
    created_at: string;
    updated_at: string;
}

export async function getUserProfile(): Promise<UserProfileData> {
    const response = await request<{ profile: UserProfileData }>(`/api/user/profile`);
    return response.profile;
}

export async function updateUserProfile(data: {
    user_nickname?: string;
    email?: string;
    avatar_url?: string;
}): Promise<{ message: string; profile: UserProfileData }> {
    return request<{ message: string; profile: UserProfileData }>(`/api/user/profile`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updatePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/user/password`, {
        method: "PUT",
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
        }),
    });
}

// Team Management
export interface TeamInfo {
    id: number;
    name: string;
    owner_id: number;
    owner_name?: string;
    description?: string;
    avatar_url?: string;
    member_count?: number;
    created_at: string;
    updated_at?: string;
}

export interface InviteCodeInfo {
    id: number;
    code: string;
    team_id: number;
    uses_allowed: number;
    uses_remaining: number;
    created_by_admin_id: number;
    created_by_admin_name?: string;
    created_at: string;
    expires_at?: string;
}

export async function getTeamInfo(): Promise<{ team: TeamInfo }> {
    return request<{ team: TeamInfo }>(`/api/team/info`);
}

export async function updateTeamInfo(data: {
    name?: string;
    description?: string;
    avatar_url?: string;
}): Promise<{ message: string; team: TeamInfo }> {
    return request<{ message: string; team: TeamInfo }>(`/api/team/info`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function generateInviteCode(data: {
    uses_allowed?: number;
    expires_in_days?: number;
}): Promise<{ message: string; invite_code: InviteCodeInfo }> {
    return request<{ message: string; invite_code: InviteCodeInfo }>(`/api/team/invite-code`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getInviteCodes(): Promise<{ invite_codes: InviteCodeInfo[] }> {
    return request<{ invite_codes: InviteCodeInfo[] }>(`/api/team/invite-codes`);
}

const apiClient = {
    setAuthToken,
    login,
    register,
    getTemplates,
    getLatest,
    getAnalysis,
    getAnalysisTypes,
    getPriceHistory,
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectAnalysis,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    getTeamInfo,
    updateTeamInfo,
    generateInviteCode,
    getInviteCodes,
};

export default apiClient;
