import os, asyncio
from typing import AsyncGenerator, List, Dict, Any
try:
    import openai
except Exception:
    openai = None

class BaseLLM:
    async def stream(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        raise NotImplementedError

class EchoLLM(BaseLLM):
    async def stream(self, messages):
        last = next((m["content"] for m in reversed(messages) if m["role"]=="user"), "Hello!")
        for ch in last:
            await asyncio.sleep(0.004)
            yield ch

class OpenAILLM(BaseLLM):
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if openai else None
        self.model = os.getenv("OPENAI_MODEL","gpt-4o-mini")
    async def stream(self, messages):
        if not self.client:
            async for t in EchoLLM().stream(messages): 
                yield t
            return
        res = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.3,
        )
        text = res.choices[0].message.content or ""
        for ch in text:
            await asyncio.sleep(0.002)
            yield ch

def get_llm() -> BaseLLM:
    if os.getenv("OPENAI_API_KEY") and openai:
        return OpenAILLM()
    return EchoLLM()
