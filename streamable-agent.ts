import "dotenv/config"
import { Agent, hostedMcpTool, MCPServerStreamableHttp, run } from '@openai/agents';

const githubMCPServer = new MCPServerStreamableHttp({
    url : 'https://gitmcp.io/openai/codex',
    name : 'GitMCP Documentation Server'
})

const agent = new Agent({
    name: 'MCP Assistant',
    instructions: 'You must always use the MCP tools to answer questions.',
    mcpServers: [githubMCPServer],
}); 

async function main(q : string){
    await githubMCPServer.connect()
    const result = await run(agent, q);
    console.log(result.finalOutput);
    await githubMCPServer.close();
}

main('What is the repo about?') 