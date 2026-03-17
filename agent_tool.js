import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios"
import "dotenv/config";

const GetWeatherResultSchema = z.object({
    city : z.string().describe('name of the city'),
    degree_c : z.number().describe('the degree celcius of the temp'),
    condition : z.string().optional().describe('condition of weather')
})

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

const agent = new Agent({
    name: "Weather agent",
    instructions: `
You are a weather assistant that gives weather of city. Keep response as short as possible
`,
    tools: [getWeatherTool],
    outputType : GetWeatherResultSchema,
});

async function main(query = "") {
    const result = await run(agent, query);
    console.log(result.finalOutput.city);
}

main("What is the weather for delhi?");