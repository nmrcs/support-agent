# Bench runs — 2026-09-15

Model: `qwen/qwen3.5-9b` · backend: `http://localhost:4001` · runs: 8 · single sequential requests, no load.

| Turn | Message                   | Latency ms (mean / min / max) | Tokens in / out (mean) | Tool expected     | Missed |
| ---- | ------------------------- | ----------------------------- | ---------------------- | ----------------- | ------ |
| 1    | Hi!                       | 1346 / 1046 / 1815            | 655 / 48               | —                 | —      |
| 2    | Where is my order 1001?   | 4785 / 3781 / 5885            | 1461 / 200             | get_order_status  | 0/8    |
| 3    | Where is order 5555?      | 8273 / 4661 / 19416           | 1684 / 357             | get_order_status  | 0/8    |
| 4    | I want to talk to a human | 5020 / 14 / 8046              | 1610 / 203             | escalate_to_human | 1/8    |

Turns where the model skipped a required tool: **1/24** (4%).
