import 'dotenv/config'
import { Agent, run } from "@openai/agents";
import { z } from "zod"
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions'
import fs from "node:fs/promises"

//refund agent

const refundAgent = new Agent({
    name: "Refund Agent",
    instructions: `
    You are an expert refund agent for internet broadband company.
    Talk to user and help them with their refund.`,
    tools: [processRefund]
})

const processRefund = tool({
    name: "process_refund",
    description: 'processes refund for the users',
    parameters: z.object({
        customerId: z.string().describe('Customer ID'),
        reason: z.string().describe('Reason for refund')
    }),
    execute: async function ({ customerId, reason }) {
        await fs.appendFile('./refunds.txt', `Refund for customer id ${customerId} with reason : ${reason}.\n`, 'utf-8')
        return { refundIssued: true };
    }
})

// sales agent

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

//reception agent 

const receptionAgent = new Agent({
    name: "Reception Agent",
    instructions: `
    ${RECOMMENDED_PROMPT_PREFIX}
    You are the customer facing agent expert in understanding what customer needs and 
    then route them or handoff to the right agent`,
    handoffDescription: `You have two agents available: 
    - salesAgent: Expert in handling queries like all plans and pricing available.
    Good for new customers.
    - refundAgent: Expert in handling queries for existing customers and issue refunds and help them.
    `,
    handoffs: [salesAgent, refundAgent]
})

async function main(query=""){
    const result = await run(receptionAgent, query);
    console.log(`Result : `, result.finalOutput);
    console.log(`History : `, result.history);
}

main('Hey can you tell the best plan for me?');         