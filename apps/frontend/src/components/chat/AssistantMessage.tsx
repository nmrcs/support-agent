import { Avatar } from '@heroui/react'
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
		<div className="flex gap-3">
			<Avatar className="size-8 shrink-0">
				<Avatar.Fallback>AI</Avatar.Fallback>
			</Avatar>
			<div className="flex-1 min-w-0 pt-1">
				<p className="whitespace-pre-wrap text-sm text-neutral-100 leading-relaxed">
					{text}
				</p>
				{escalated && (
					<div className="mt-2 text-xs text-amber-400">
						Escalated to operator
					</div>
				)}
				{trace && (
					<div className="mt-2">
						<TraceTimeline trace={trace} />
					</div>
				)}
			</div>
		</div>
	)
}
