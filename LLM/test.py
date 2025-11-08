from llm_model import generate
import asyncio

async def fun():
    res = await generate("Hey How are u? give me 500 words essay inside curly braces on lord Ram")
    print(res)


# Run the async function
asyncio.run(fun())