// Replays the reference dialog against a running backend and writes the
// numbers to bench/runs.md (+ raw JSON next to it). Usage:
//   npm run bench            8 runs against http://localhost:4001
//   BENCH_RUNS=4 npm run bench
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ChatResponse, LoginResponse } from '@support-agent/contracts'

const BASE = process.env.BACKEND_URL ?? 'http://localhost:4001'
const RUNS = Number(process.env.BENCH_RUNS ?? 8)
const EMAIL = 'alice@example.com'
const PASSWORD = 'demo'

interface TurnSpec {
	text: string
	// The tool this turn must call; null when calling any tool is a mistake.
	expectedTool: string | null
}

const DIALOG: TurnSpec[] = [
	{ text: 'Hi!', expectedTool: null },
	{ text: 'Where is my order 1001?', expectedTool: 'get_order_status' },
	{ text: 'Where is order 5555?', expectedTool: 'get_order_status' },
	{ text: 'I want to talk to a human', expectedTool: 'escalate_to_human' },
]

interface TurnResult {
	run: number
	turn: number
	text: string
	latencyMs: number
	promptTokens: number
	completionTokens: number
	toolsCalled: string[]
	expectedTool: string | null
	toolMissed: boolean
	escalated: boolean
}

async function api<T>(
	path: string,
	init: RequestInit,
	token?: string,
): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	})
	if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
	if (res.status === 204) return undefined as T
	return res.json() as Promise<T>
}

async function main(): Promise<void> {
	const health = await api<{ model: string }>('/health', {})
	const login = await api<LoginResponse>('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
	})
	const token = login.accessToken

	const results: TurnResult[] = []
	for (let run = 1; run <= RUNS; run++) {
		await api<void>('/chat', { method: 'DELETE' }, token)
		for (let t = 0; t < DIALOG.length; t++) {
			const spec = DIALOG[t]
			const started = Date.now()
			const res = await api<ChatResponse>(
				'/chat',
				{ method: 'POST', body: JSON.stringify({ text: spec.text }) },
				token,
			)
			const toolsCalled = res.trace.steps
				.filter((s) => s.kind === 'tool')
				.map((s) => s.name)
			results.push({
				run,
				turn: t + 1,
				text: spec.text,
				latencyMs: Date.now() - started,
				promptTokens: res.trace.usage.promptTokens,
				completionTokens: res.trace.usage.completionTokens,
				toolsCalled,
				expectedTool: spec.expectedTool,
				toolMissed:
					spec.expectedTool !== null &&
					!toolsCalled.includes(spec.expectedTool),
				escalated: res.escalated,
			})
			process.stdout.write(
				`run ${run} turn ${t + 1}: ${Date.now() - started} ms, tools [${toolsCalled.join(', ')}]\n`,
			)
		}
	}
	await api<void>('/chat', { method: 'DELETE' }, token)

	writeReport(health.model, results)
}

function writeReport(model: string, results: TurnResult[]): void {
	const date = new Date().toISOString().slice(0, 10)
	const lines: string[] = [
		`# Bench runs — ${date}`,
		'',
		`Model: \`${model}\` · backend: \`${BASE}\` · runs: ${RUNS} · single sequential requests, no load.`,
		'',
		'| Turn | Message | Latency ms (mean / min / max) | Tokens in / out (mean) | Tool expected | Missed |',
		'| --- | --- | --- | --- | --- | --- |',
	]

	for (let t = 1; t <= DIALOG.length; t++) {
		const rows = results.filter((r) => r.turn === t)
		const lat = rows.map((r) => r.latencyMs)
		const missed = rows.filter((r) => r.toolMissed).length
		lines.push(
			`| ${t} | ${DIALOG[t - 1].text} | ${mean(lat)} / ${Math.min(...lat)} / ${Math.max(...lat)} | ${mean(rows.map((r) => r.promptTokens))} / ${mean(rows.map((r) => r.completionTokens))} | ${DIALOG[t - 1].expectedTool ?? '—'} | ${DIALOG[t - 1].expectedTool ? `${missed}/${rows.length}` : '—'} |`,
		)
	}

	const expected = results.filter((r) => r.expectedTool !== null)
	const missed = expected.filter((r) => r.toolMissed)
	lines.push(
		'',
		`Turns where the model skipped a required tool: **${missed.length}/${expected.length}** (${Math.round((100 * missed.length) / expected.length)}%).`,
		'',
	)

	mkdirSync('bench', { recursive: true })
	writeFileSync(join('bench', 'runs.md'), lines.join('\n'))
	writeFileSync(join('bench', 'runs.json'), JSON.stringify(results, null, '\t'))
	console.log(`\nWrote bench/runs.md and bench/runs.json`)
}

function mean(nums: number[]): number {
	return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
