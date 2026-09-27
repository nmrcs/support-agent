import { Chip } from '@heroui/react'
import type { TurnTrace } from '@support-agent/contracts'
import { TraceTimeline } from './TraceTimeline'

export function AssistantMessage({
	text,
	trace,
	escalated = false,
}: {
	text: string
	trace?: TurnTrace
	escalated?: boolean
}) {
	return (
		<div className="flex flex-col items-start gap-2.5">
			<p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
			{escalated && (
				<Chip size="sm" variant="soft" color="warning">
					Escalated to operator
				</Chip>
			)}
			{trace && (
				<div className="w-full">
					<TraceTimeline trace={trace} />
				</div>
			)}
		</div>
	)
}
