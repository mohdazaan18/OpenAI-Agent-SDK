# OpenAI Agent SDK - Examples Collection

This repository contains a collection of practical code examples demonstrating how to build, manage, and scale AI agents using the `@openai/agents` SDK. 

It serves as a reference guide for various agentic patterns, ranging from simple tool calling to complex multi-agent swarms with guardrails and human oversight.

## 📂 What's Inside?

The project is structured around self-contained examples. Here is a breakdown of the core patterns included:

### 1. Multi-Agent Swarms & Handoffs
Learn how to create specialized agents that can collaborate and pass execution to one another based on customer needs.
- **`agent_handoff.js`**: Demonstrates a "Reception Agent" that categorizes requests and routes them to specialized `salesAgent` or `refundAgent` instances.
- **`agent_manager.js`**: Shows how one agent (Sales) can use another agent (Refund) as a tool to handle specific sub-tasks.

### 2. Guardrails (Input & Output Validation)
Ensure your agents behave predictably and securely by validating what goes in and what comes out.
- **`input_guard.js`**: Implements pre-execution checks (e.g., verifying a prompt is strictly a math block) using tripwires to reject invalid inputs before reaching the main agent.
- **`output_guard.js`**: Implements post-execution checks, validating the agent's output (e.g., ensuring generated SQL queries are read-only and not destructive) before returning them to the user.

### 3. Human-in-the-Loop (HITL)
- **`human-loop.ts`**: Demonstrates how to pause agent execution to ask for human approval before executing sensitive operations (like sending an email via an API). It uses the SDK's `interruptions` to wait for explicit user consent.

### 4. Memory & Conversation History
- **`server-conv.js`**: Shows how to maintain conversational memory effortlessly using built-in SDK state management `conversationId`.
- **`convo.js`**: An example of manually tracking and passing a shared `history` array to the agent during execution runs.

### 5. MCP (Model Context Protocol) Integration
- **`hosted-agent.ts`**: Example of connecting an agent to a Hosted MCP Server (`hostedMcpTool`) to fetch external knowledge dynamically.
- **`streamable-agent.ts`**: Connects to a streamable HTTP MCP server, initializing the connection map before executing the agent run.
- **`mcp.txt`**: Architecture notes outlining the differences between Hosted MCP, Streamable HTTP MCP, and Stdio MCP servers.

### 6. Streaming Responses
- **`streaming.ts`**: Demonstrates how to handle real-time streaming responses from your agent, pushing text chunks seamlessly as they are generated.

### 7. Basic Tool Calling & Structured Outputs
- **`agent_tool.js`**: A fundamental example showing how to equip an agent with external functions (like hitting a weather API) and enforcing structured outputs using `zod`.

## 🚀 Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in necessary API keys (like `OPENAI_API_KEY`, `BREVO_API_KEY` for email tests, etc.):
   ```bash
   cp .env.example .env
   ```

3. Run any of the examples directly using Node or TypeScript:
   ```bash
   node agent_handoff.js
   # or
   npx ts-node human-loop.ts
   ```

## Requirements
- Node.js
- Valid OpenAI API Key (and other specific API keys if experimenting with tools like Brevo or Wttr.in).
