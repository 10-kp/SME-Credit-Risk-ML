from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Literal, AsyncGenerator
from llm import get_llm

app = FastAPI(title="CAAS Chat API", version="0.2")

class Msg(BaseModel):
    role: Literal["system","user","assistant"]
    content: str

class ChatBody(BaseModel):
    messages: List[Msg]

@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/chat")
async def chat(body: ChatBody):
    llm = get_llm()
    msgs = body.messages
    if not msgs or msgs[0].role != "system":
        msgs = [Msg(role="system", content="You are CAAS Chat. Be concise and helpful.")] + msgs

    async def gen() -> AsyncGenerator[bytes, None]:
        async for token in llm.stream([m.model_dump() for m in msgs]):
            yield f"data: {token}\n".encode("utf-8")
        yield b"data: [DONE]\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
