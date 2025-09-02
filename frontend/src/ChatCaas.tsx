import React from "react"

type Msg = { id: string; role: "user" | "assistant"; content: string }
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

async function* streamChat(body: any) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok || !res.body) throw new Error("Chat request failed")
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    // Expecting SSE lines like: "data: <chunk>"
    const lines = buf.split("\n")
    for (const line of lines) {
      if (!line.startsWith("data:")) continue
      const data = line.slice(5).trim()
      if (!data) continue
      if (data === "[DONE]") return
      yield data
    }
    buf = ""
  }
}

export default function ChatCaas() {
  const [messages, setMessages] = React.useState<Msg[]>([])
  const [input, setInput] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  async function send(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    const user: Msg = { id: uid(), role: "user", content: text }
    const asst: Msg = { id: uid(), role: "assistant", content: "" }
    setMessages(prev => [...prev, user, asst])
    setInput("")
    setBusy(true)
    try {
      const history = [{ role: "system", content: "You are CAAS Chat. Be concise and helpful." as const }]
        .concat(messages.map(m => ({ role: m.role, content: m.content } as const)))
        .concat({ role: "user" as const, content: text })
      let acc = ""
      for await (const chunk of streamChat({ messages: history })) {
        acc += chunk
        setMessages(prev => prev.map(m => (m.id === asst.id ? { ...m, content: acc } : m)))
      }
    } catch (err: any) {
      setMessages(prev => prev.map(m => (m.id === asst.id ? { ...m, content: "⚠️ " + (err.message || err) } : m)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl h-[80vh] bg-white rounded-2xl shadow border border-neutral-200 flex flex-col">
      <header className="p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold">CAAS Chat</h2>
        <p className="text-xs text-neutral-500">Streaming via SSE</p>
      </header>

      <div ref={listRef} className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map(m => (
          <div key={m.id} className={m.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"}>
            <div className={(m.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-900") + " rounded-2xl px-4 py-2 whitespace-pre-wrap"}>
              {m.content || (m.role === "assistant" ? "…" : null)}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-neutral-500">Say hi to get started…</div>
        )}
      </div>

      <form onSubmit={send} className="p-3 border-t border-neutral-200 flex gap-2">
        <input
          className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={busy ? "Thinking…" : "Type a message"}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl px-4 py-2 bg-blue-600 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
