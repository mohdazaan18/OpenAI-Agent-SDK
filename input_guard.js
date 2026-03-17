import "dotenv/config"
import { Agent, InputGuardrailTripwireTriggered, run } from "@openai/agents"
import { z } from "zod"

const mathInputAgent = new Agent({
    name: "Math query checker",
    instructions: `You are an input guardrail agent that checks if the user query is maths question or not.
    Rules :
    - The question has to be strictly a maths question.
    - Reject any other kind of request even if it is related to maths.
    `,
    outputType: z.object({
        isValidMathsQuestion: z.boolean.describe('If the question is a math question'),
        reason: z.string().optional().describe('reason to reject')
    })
})

const mathsInputGuardrail = {
    name: "Math Guardrail",
    execute: async ({ input }) => {
        const result = await run(mathInputAgent, input);
        return {
            outputInfo: result.finalOutput.reason,
            tripwireTriggered: !result.finalOutput.isValidMathsQuestion
        }
    }
}

const mathsAgent = new Agent({
    name: "Maths Agent",
    instructions: `You are an expert maths ai agent.`,
    inputGuardrails: [mathsInputGuardrail]
})


async function main(query = "") {
    try {
        const result = await run(mathsAgent, query);
        console.log("Result: ", result.finalOutput)
    } catch (error) {
        if (e instanceof InputGuardrailTripwireTriggered) {
            console.log(`Invalid Input: Rejected because ${e.message}`)
        }
    }
}

main("What is 2*2/5*10?")