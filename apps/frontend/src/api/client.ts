import type {
	ChatHistory,
	ChatResponse,
	ConversationDetail,
	ConversationSummary,
	LoginResponse,
} from '@support-agent/contracts'
import { useSession } from '../store/session'

const BASE = import.meta.env.VITE_BACKEND_URL

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const { accessToken } = useSession.getState()
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
			...init.headers,
		},
	})
	// There is no refresh flow: an expired token means logging in again.
	if (res.status === 401) {
		useSession.getState().clearAuth()
		throw new Error('401 Unauthorized')
	}
	if (!res.ok) {
		const body = await res.text()
		throw new Error(`${res.status} ${res.statusText}: ${body}`)
	}
	if (res.status === 204) return undefined as T
	return res.json() as Promise<T>
}

export function login(email: string, password: string): Promise<LoginResponse> {
	return request<LoginResponse>('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	})
}

export function sendMessage(text: string): Promise<ChatResponse> {
	return request<ChatResponse>('/chat', {
		method: 'POST',
		body: JSON.stringify({ text }),
	})
}

export function getHistory(): Promise<ChatHistory> {
	return request<ChatHistory>('/chat')
}

export function resetChat(): Promise<void> {
	return request<void>('/chat', { method: 'DELETE' })
}

export function listConversations(): Promise<ConversationSummary[]> {
	return request<ConversationSummary[]>('/conversations')
}

export function getConversation(id: string): Promise<ConversationDetail> {
	return request<ConversationDetail>(`/conversations/${id}`)
}
