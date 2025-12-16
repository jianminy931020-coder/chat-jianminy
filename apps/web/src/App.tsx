import { gql  } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

const CHAT = gql`
  mutation Chat($messages: [ChatMessageInput!]!) {
    chat(messages: $messages) {
      reply
    }
  }
`;

export default function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  const [chat, { loading, error }] = useMutation(CHAT);

  async function send() {
    const msg = input.trim();
    if (!msg) return;

    const next = [...history, { role: "user", content: msg }];
    setHistory(next);
    setInput("");

    const res:any = await chat({ variables: { messages: next } });
    const reply = res.data?.chat?.reply ?? "(no reply)";
    setHistory([...next, { role: "assistant", content: reply }]);
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>chat.jianminy.org</h2>

      <div style={{ border: "1px solid #ddd", padding: 12, minHeight: 260 }}>
        {history.filter(m => m.role !== "system").map((m, i) => (
          <div key={i} style={{ margin: "8px 0" }}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
        {error && <div><b>Error:</b> {error.message}</div>}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 8 }}
          placeholder="Say something..."
        />
        <button onClick={send} disabled={loading || !input.trim()}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
