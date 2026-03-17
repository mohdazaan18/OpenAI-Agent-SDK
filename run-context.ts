import "dotenv/config"
import { Agent, run, tool, RunContext } from "@openai/agents"
import { z } from "zod"

interface MyContext {
    userId: string,
    userName: string, 
    fetchUserInfoFromDb : () => Promise<string>
}

const getUserInfoTool = tool({
    name: "get_user_info",
    description: "Get the user info",
    parameters: z.object({}),
    execute: async (_, ctx?: RunContext<MyContext>): Promise<string | undefined> => {
        return await ctx?.context.fetchUserInfoFromDb();
    }

})

const customerSupportAgent = new Agent<MyContext>({
    name: 'Customer support agent',
    instructions: ({ context }) => {
        return `You are an expert customer support agent.`
    },
    tools: [getUserInfoTool]
})

async function main(q: string, ctx: MyContext) {
    const result = await run(customerSupportAgent, q, {
        context: ctx
    });
    console.log("Result : ", result.finalOutput)
}

main('I am unable to login.', {
    userId: "1",
    userName: "Azaan",
    fetchUserInfoFromDb : async () => `UserId=1,UserName=Azaan`
})