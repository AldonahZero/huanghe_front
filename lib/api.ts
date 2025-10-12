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
    } catch (e) {
        // non-json response
        data = text;
    }

    if (!res.ok) {
        const message = (data && typeof data === "object" && (data as any).message) || (data && typeof data === "object" && (data as any).error) || res.statusText || "Request failed";
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

export default {
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
};
