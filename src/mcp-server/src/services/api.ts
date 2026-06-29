import axios, { AxiosInstance, AxiosError } from "axios";

export interface ApiResponse<T> {
  data: T;
  error: null | { message: string };
}

export interface Task {
  [key: string]: unknown;
  id: number;
  taskNumber: number;
  teamId: string;
  authorId: string;
  title: string;
  status: string;
  priority: "low" | "medium" | "high";
  kanbanOrder: number;
  duedate: string | null;
  description: string;
  properties: Record<string, unknown>;
  recurrenceScheduleId: string | null;
  recurrenceOccurrenceDate: string | null;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  [key: string]: unknown;
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  taskId: number;
  createdById: string;
  createdBy?: { name: string | null; email: string };
}

export interface Attachment {
  [key: string]: unknown;
  id: string;
  taskId: number;
  filename: string;
  mimeType?: string;
  size?: number;
  url: string;
  createdAt?: string;
}

export interface RpaProcedure {
  [key: string]: unknown;
}

export interface TiaProcedure {
  [key: string]: unknown;
}

export interface PiaProcedure {
  [key: string]: unknown;
}

export interface RmRisk {
  [key: string]: unknown;
  Risk?: string;
  AssetOwner?: string;
  Impact?: string;
  RawProbability?: number;
  RawImpact?: number;
  RiskTreatment?: string;
  TreatmentCost?: string;
  TreatmentStatus?: number;
  TreatedProbability?: number;
  TreatedImpact?: number;
}

export interface CreateTaskInput {
  title: string;
  status?: string;
  priority?: "low" | "medium" | "high";
  description?: string;
  duedate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  status?: string;
  priority?: "low" | "medium" | "high";
  description?: string;
  duedate?: string;
}

export interface CscStatus {
  [key: string]: unknown;
  controlId: string;
  status: string;
  note?: string;
}

export interface ApiKey {
  [key: string]: unknown;
  id: string;
  name: string;
  createdAt: string;
}

let client: AxiosInstance | null = null;

export function getClient(): AxiosInstance {
  if (!client) {
    const baseURL = process.env.API_BASE_URL;
    const token = process.env.API_BEARER_TOKEN;

    if (!baseURL) throw new Error("API_BASE_URL environment variable is required");
    if (!token) throw new Error("API_BEARER_TOKEN environment variable is required");

    client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  }
  return client;
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const res = await getClient().get<ApiResponse<T>>(path);
    if (res.data.error) throw new Error(res.data.error.message);
    return res.data.data;
  } catch (err) {
    throw formatError(err);
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await getClient().post<ApiResponse<T>>(path, body);
    if (res.data.error) throw new Error(res.data.error.message);
    return res.data.data;
  } catch (err) {
    throw formatError(err);
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await getClient().put<ApiResponse<T>>(path, body);
    if (res.data.error) throw new Error(res.data.error.message);
    return res.data.data;
  } catch (err) {
    throw formatError(err);
  }
}

export async function apiPostMultipart<T>(path: string, formData: FormData): Promise<T> {
  try {
    const res = await getClient().post<ApiResponse<T>>(path, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.error) throw new Error(res.data.error.message);
    return res.data.data;
  } catch (err) {
    throw formatError(err);
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  try {
    const res = await getClient().delete<ApiResponse<T>>(path);
    if (res.data.error) throw new Error(res.data.error.message);
    return res.data.data;
  } catch (err) {
    throw formatError(err);
  }
}

function formatError(err: unknown): Error {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const message = (err.response?.data as ApiResponse<unknown>)?.error?.message || err.message;
    if (status === 401) return new Error("Unauthorized: Check your API_BEARER_TOKEN");
    if (status === 403) return new Error("Forbidden: Insufficient permissions for this action");
    if (status === 404) return new Error("Not found: The requested resource does not exist");
    return new Error(`API error ${status}: ${message}`);
  }
  if (err instanceof Error) return err;
  return new Error(String(err));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
