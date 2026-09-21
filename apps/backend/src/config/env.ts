import { z } from 'zod'

// The example file ships this value so a fresh clone boots; a deployment that
// keeps it has a public JWT secret.
const EXAMPLE_JWT_SECRET = 'dev-secret-change-me-please'

const envSchema = z.object({
	DATABASE_URL: z
		.string()
		.url()
		.regex(/^postgres(ql)?:\/\//),
	PORT: z.coerce.number().default(4001),
	LLM_BASE_URL: z.string().url(),
	LLM_API_KEY: z.string().min(1),
	LLM_MODEL: z.string().min(1),
	AUTH_JWT_SECRET: z
		.string()
		.min(16)
		.refine((s) => s !== EXAMPLE_JWT_SECRET, {
			message: 'AUTH_JWT_SECRET still holds the example value; generate one',
		}),
	AUTH_ACCESS_TTL: z.string().default('12h'),
	FRONTEND_ORIGIN: z.string().url().default('http://localhost:4000'),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): Env {
	return envSchema.parse(config)
}
