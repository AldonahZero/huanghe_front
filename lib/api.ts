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
        // 如果是未授权（JWT 过期或无效），在客户端清理本地 auth 并重定向到登录页
        if (res.status === 401 && typeof window !== "undefined") {
            try {
                // 清理本地存储与客户端 token
                localStorage.removeItem("hh_token");
                localStorage.removeItem("hh_user");
                localStorage.removeItem("hh_permissions");
                setAuthToken(null);
            } catch (e) {
                // ignore
            }

            // 不在公开页面时，跳转到登录页并保留 next
            const current = window.location.pathname + window.location.search;
            const PUBLIC = ["/", "/login", "/register"];
            const isPublic = PUBLIC.some((p) => current === p || current.startsWith(p + "/"));
            if (!isPublic) {
                try {
                    window.location.replace(`/login?next=${encodeURIComponent(current)}`);
                } catch (e) {
                    // ignore
                }
            }
        }

        const dataObj = data && typeof data === "object" && data !== null ? (data as Record<string, unknown>) : undefined;
        const originalMessage = (dataObj && (dataObj["message"] ?? dataObj["error"])) ?? res.statusText ?? "Request failed";

        // 翻译常见错误信息为中文提示，保留原始信息在 originalMessage 字段中
        let zhMessage = "请求失败";
        try {
            const code = res.status;
            if (code === 400) zhMessage = "请求无效，请检查输入参数";
            else if (code === 401) zhMessage = "未授权或登录已过期，请重新登录";
            else if (code === 403) zhMessage = "没有权限执行此操作";
            else if (code === 404) zhMessage = "未找到请求的资源";
            else if (code >= 500 && code < 600) zhMessage = "服务器内部错误，请稍后重试";
            else if (typeof originalMessage === "string" && originalMessage.length) zhMessage = String(originalMessage);
        } catch (e) {
            zhMessage = String(originalMessage);
        }

        const err: { message: string; status: number; payload?: unknown; originalMessage?: unknown } = {
            message: zhMessage,
            status: res.status,
            payload: data,
            originalMessage: originalMessage,
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

// Search templates by name (假设后端提供此接口)
export async function searchTemplates(query: string): Promise<{
    templates: Array<{
        id?: number;
        name: string;
        market_hash_name?: string;
        icon_url?: string;
        weapon?: string;
        exterior?: string;
    }>;
}> {
    // 调用后端代理的外部 autocomplete：/api/items/search
    // 规范（见 Swagger）返回 { data: [ { market_name, market_hash_name, icon_url, ... } ] }
    try {
        const limit = 20;
        const resp = await request<{ data?: Array<{ market_name?: string; market_hash_name?: string; icon_url?: string; template_id?: number }> }>(`/api/items/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        const items = resp?.data || [];

        const templates = items.map((it) => ({
            id: typeof it.template_id === "number" ? it.template_id : undefined,
            name: it.market_name || it.market_hash_name || "",
            market_hash_name: it.market_hash_name,
            icon_url: it.icon_url,
            weapon: undefined,
            exterior: undefined,
        }));

        return { templates };
    } catch (err) {
        console.warn("searchTemplates failed:", err);
        return { templates: [] };
    }
}

// 获取单个模板的完整详情
export async function getTemplate(templateId: number): Promise<{
    id: number;
    name: string;
    market_hash_name?: string;
    icon_url?: string;
    weapon?: string;
    exterior?: string;
    quality?: string;
    rarity?: string;
    // 后端可能返回更多字段，这里用索引签名以便前端兼容
    [key: string]: any;
}> {
    return request(`/api/latest/${templateId}`);
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

export async function createProject(payload: {
    name: string;
    template_id?: number | null;
    template_info?: any;
    member_level_required?: string;
    is_active?: boolean;
    monitor_frequency?: number;
}): Promise<{ project?: TProject }> {
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

export async function updateProjectStatus(
    projectId: number,
    action: "activate" | "deactivate"
): Promise<{ project: { id: number; is_active: boolean } }> {
    return request<{ project: { id: number; is_active: boolean } }>(
        `/api/projects/${projectId}/status`,
        {
            method: "PUT",
            body: JSON.stringify({ action }),
        }
    );
}

// Project Analysis
export interface ProjectAnalysisResponse {
    project: {
        id: number;
        name: string;
        template_id: number;
        is_active: boolean;
        created_at: string | null;
        crawl_interval?: number; // 数据抓取间隔(分钟)
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
            storeName?: string;
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
    owner_nickname?: string | null;
    description?: string;
    avatar_url?: string;
    member_count?: number;
    created_at: string;
    updated_at?: string;
}

// 列表接口中返回的老师条目
export interface TeamTeacher {
    id: number;
    username: string;
    user_nickname?: string | null;
}

// 列表接口可能包含的额外字段
export interface TeamListItem extends TeamInfo {
    owner_nickname?: string | null;
    invite_quota?: number;
    teachers?: TeamTeacher[];
}

// 团队成员（用于团队详情）
export interface TeamMember {
    user_id: number;
    username: string;
    user_nickname?: string | null;
    role_in_team: string; // member/teacher/leader
    joined_at: string;
    inviter_user_id?: number | null;
    // 可选：成员在团队/会员系统中的等级（如 core/private_director 等）
    member_level?: string | null;
}

// 团队详情中的邀请 (与 invites 字段格式一致)
export interface TeamInvite {
    code: string;
    uses_allowed: number;
    uses_remaining: number;
    expires_at?: string | null;
    created_by_admin_id?: number | null;
    assigned_to_user_id?: number | null;
    is_active: boolean;
    created_at: string;
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
    // 新增: 此邀请码所授予的会员级别（可选）
    member_level?: string;
}

// 获取团队列表 (管理员看所有,教师看自己的)
export async function getTeams(): Promise<{ teams: TeamListItem[] }> {
    return request<{ teams: TeamListItem[] }>(`/api/teams`);
}

// 获取指定团队信息 (通过team_id)
export async function getTeamInfo(teamId?: number): Promise<{ team: TeamInfo; members?: TeamMember[]; invites?: TeamInvite[] }> {
    // 前端点击团队卡片时后端约定为 GET /api/teams/<team_id>
    if (teamId) {
        return request<{ team: TeamInfo; members?: TeamMember[]; invites?: TeamInvite[] }>(`/api/teams/${teamId}`);
    }

    // 如果未传 teamId，则保留获取当前用户团队信息的旧路径（兼容旧后端）
    return request<{ team: TeamInfo }>(`/api/team/info`);
}

// 通过用户 ID 获取该用户所属的团队信息（包含成员和邀请码）
export async function getTeamByUserId(userId: number): Promise<{ team: TeamInfo; members: TeamMember[]; invites: TeamInvite[] }> {
    return request<{ team: TeamInfo; members: TeamMember[]; invites: TeamInvite[] }>(`/api/team/user/${userId}`);
}

export async function updateTeamInfo(teamId: number, data: {
    name?: string;
    description?: string;
    avatar_url?: string;
}): Promise<{ message: string; team: TeamInfo }> {
    return request<{ message: string; team: TeamInfo }>(`/api/team/${teamId}/info`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function generateInviteCode(teamId: number, data: {
    uses_allowed?: number;
    expires_in_days?: number;
    // 可选: 生成的邀请码将授予的新成员的会员级别
    member_level?: string;
}): Promise<{ message: string; invite_code: InviteCodeInfo }> {
    return request<{ message: string; invite_code: InviteCodeInfo }>(`/api/team/${teamId}/invite-code`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getInviteCodes(teamId: number): Promise<{ invite_codes: InviteCodeInfo[] }> {
    return request<{ invite_codes: InviteCodeInfo[] }>(`/api/team/${teamId}/invite-codes`);
}

// 更新团队成员的 member_level(管理员或团队老师可用)
export async function updateTeamMemberLevel(teamId: number, memberUserId: number, member_level: string | null): Promise<{ message: string; member: { user_id: number; username: string; user_nickname?: string | null; member_level?: string | null } }> {
    return request<{ message: string; member: { user_id: number; username: string; user_nickname?: string | null; member_level?: string | null } }>(`/api/team/${teamId}/members/${memberUserId}/member-level`, {
        method: "PUT",
        body: JSON.stringify({ member_level }),
    });
}

// User Trading Behavior - 用户交易行为
export interface TradingBehaviorResponse {
    timestamp: string;
    user_info: {
        nickname_history: Array<{
            name: string;
            first_seen: string;
            last_seen: string;
        }>;
        store_name_history: Array<{
            name: string;
            first_seen: string;
            last_seen: string;
        }>;
    };
    summary: {
        active_listings: number;
        current_page_count: number;
        page_index: number;
        page_size: number;
        total_sell_count: number;
    };
    delivery_statistics: {
        avg_deliver_time: string;
        deliver_success_rate: string;
        un_deliver_number: string;
    };
    sell_timeline: Array<{
        commodity_id?: number;
        commodity_no?: string;
        order_id?: string | null;
        template_id?: number;
        template_name?: string | null;
        price: string | number;
        abrade: string;
        abrade_min?: string | null;
        abrade_max?: string | null;
        position: number;
        quantity?: number;
        exterior_name?: string | null;
        crawl_time: string;
        can_bargain?: boolean | null;
        original_price?: string | number | null;
        stickers?: Array<{
            Name: string;
            [key: string]: any;
        }>;
    }>;
    purchase_timeline: Array<{
        order_id?: string | null;
        template_id?: number;
        template_name?: string | null;
        price: string | number | null;
        abrade: string;
        abrade_min?: string | null;
        abrade_max?: string | null;
        position: number;
        quantity?: number;
        exterior?: string | null;
        exterior_name?: string | null;
        crawl_time: string;
        stickers?: Array<{
            Name: string;
            [key: string]: any;
        }>;
    }>;
}export async function getUserTradingBehavior(userId: number): Promise<TradingBehaviorResponse> {
    return request<TradingBehaviorResponse>(`/api/users/${userId}/trading-behavior`);
}

const apiClient = {
    setAuthToken,
    login,
    register,
    getTemplates,
    searchTemplates,
    getLatest,
    getAnalysis,
    getAnalysisTypes,
    getPriceHistory,
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    getProjectAnalysis,
    getUserProfile,
    updateUserProfile,
    updatePassword,
    getTeams,
    getTeamInfo,
    getTeamByUserId,
    updateTeamInfo,
    generateInviteCode,
    getInviteCodes,
    updateTeamMemberLevel,
    getUserTradingBehavior,
};

export default apiClient;
