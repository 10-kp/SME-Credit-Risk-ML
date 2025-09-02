import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import ChatCaas from "./ChatCaas"

function App() {
  return (
    <div className="min-h-screen w-full bg-neutral-50 flex items-center justify-center p-6">
      <ChatCaas />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
