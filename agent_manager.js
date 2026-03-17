import 'dotenv/config'
import { Agent, run } from "@openai/agents";
import fs from "node:fs/promises"
import { z } from "zod"

const fetchAvailablePlans = tool({
    name: "fetch_available_plans",
    description: 'fetches the available plans for internet',
    parameters: z.object({}),
    execute: async function () {
        return [{ plan_id: 1, price_inr: 399, speed: '30mb/s' },
        { plan_id: 2, price_inr: 999, speed: '100mb/s' },
        { plan_id: 3, price_inr: 1499, speed: '200mb/s' }
        ]
    }
})

const processRefund = tool({
    name: "process_refund",
    description: 'processes refund for the users',
    parameters: z.object({
        customerId: z.string().describe('Customer ID'),
        reason: z.string().describe('Reason for refund')
    }),
    execute: async function ({ customerId, reason }) {
        await fs.appendFile('./refunds.txt', `Refund for customer id ${customerId} with reason : ${reason}`, 'utf-8')
        return { refundIssued: true };
    }
})

const refundAgent = new Agent({
    name: "Refund Agent",
    instructions: `
    You are an expert refund agent for internet broadband company.
    Talk to user and help them with their refund.`,
    tools: [processRefund]
})

const salesAgent = new Agent({
    name: "Sales Agent",
    instructions: `
    You are an expert sales agent for internet broadband company.
    Talk to user and help them what they need.`,
    tools: [fetchAvailablePlans, refundAgent.asTool({
        toolName: 'refund_expert',
        toolDescription: 'Handles refund questions and requests.'
    })]
})

async function runAgent(query = "") {
    const result = await run(salesAgent, query);
    console.log(result.finalOutput);
}

runAgent(`Hey I had a plan but i want the refund my customer id is ID123`);