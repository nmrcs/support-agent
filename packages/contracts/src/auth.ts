import { z } from 'zod'

export const LoginRequest = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})
export type LoginRequest = z.infer<typeof LoginRequest>

export const AuthUser = z.object({
	id: z.string(),
	email: z.string().email(),
	name: z.string(),
})
export type AuthUser = z.infer<typeof AuthUser>

export const LoginResponse = z.object({
	user: AuthUser,
	accessToken: z.string(),
})
export type LoginResponse = z.infer<typeof LoginResponse>
