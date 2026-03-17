import "dotenv/config"
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod"
import axios from "axios"
import readline from 'node:readline/promises';

const getWeatherTool = tool({
    name: "get_weather",
    description: "Get current weather of a city like Delhi, London, Tokyo",
    parameters: z.object({
        city: z.string().describe("City name like delhi or mumbai"),
    }),
    execute: async ({ city }) => {
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
        const res = await axios.get(url, { responseType: "text" });
        return res.data;
    },
});

const sendEmailTool = tool({
    name: "send_email",
    description: "Send email to the user",
    parameters: z.object({
        to: z.string().describe('Recipient email address'),
        subject: z.string().describe('Subject of the email'),
        html: z.string().describe('HTML body of the email')
    }),
    needsApproval: true,
    execute: async ({ to, subject, html }) => {
        const API_KEY = process.env.BREVO_API_KEY;
        try {
            const response = await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                {
                    sender: { name: 'Mohd Azaan', email: 'codingtestclone@gmail.com' },
                    to: [{ email: to, name: 'Recipient' }],
                    subject,
                    htmlContent: html
                },
                {
                    headers: {
                        'api-key': API_KEY,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            return `Email sent successfully: ${JSON.stringify(response.data)}`;
        } catch (error: any) {
            if (error.response) {
                return `Error response: ${JSON.stringify(error.response.data)}`;
            }
            return `Error: ${error.message}`;
        }
    }
});

const agent = new Agent({
    name: "Weather email agent",
    instructions: `You are an expert agent in getting weather info and sending it using email to the user.`,
    tools: [getWeatherTool, sendEmailTool]
})

async function askForUserConfirmation(q: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const answer = await rl.question(`${q} (y/n): `);
    const normalizedAnswer = answer.toLowerCase();
    rl.close();
    return normalizedAnswer === 'y' || normalizedAnswer === 'yes';
}

async function main(query: string) {
    let result = await run(agent, query);
    let hasInteruptions = result.interruptions.length > 0;

    while (hasInteruptions) {
        const currentState = result.state;
        for (const interupt of result.interruptions) {
            if (interupt.type === 'tool_approval_item') {
                const isAllowed = await askForUserConfirmation(`
                Agent ${interupt.agent.name} is asking for calling tool ${interupt.rawItem.name}
                with arguments ${interupt.rawItem.arguments}
                `)
                if (isAllowed) {
                    currentState.approve(interupt)
                }
                else {
                    currentState.reject(interupt);
                }
                result = await run(agent, currentState);
                hasInteruptions = result.interruptions?.length > 0;
            }
        }
    }
}

main('What is weather of delhi and goa and send me on laazaan18@gmail.com?')