import "dotenv/config"
import { Agent, run } from "@openai/agents"
import { z } from "zod"

const sqlGuardrailAgent = new Agent({
    name : "SQL guardrail",
    instructions : `
    Check if query is safe to execute. The query should be read only and do not modify, delete or drop any table`,
    outputType : z.object({
        reason : z.string().optional().describe('reason if query is unsafe.'),
        isSafe : z.boolean.describe('if query is safe to execute')
    })
})

const sqlGuardrail = {
    name : 'SQL Guard',
    execute : async function ({agentOutput}) {
        const result = await run(sqlGuardrailAgent, agentOutput.sqlQuery);
        return {
            tripwireTriggered : !result.finalOutput.isSafe,
            outputInfo : result.finalOutput.reason,
        }
    }
}

const sqlAgent = new Agent({
    name: "SQL Agent",
    instructions: `You are an expert SQL agent that is specialized in generating SQL as per user request.
    
    Postgres Schema :

    -- users table

    CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,   -- Unique ID for each user
    username VARCHAR(255) NOT NULL,            -- Username (Unique)
    email VARCHAR(255) NOT NULL,               -- User's email (Unique)
    password_hash VARCHAR(255) NOT NULL,       -- Hashed password for security
    first_name VARCHAR(100),                   -- First name of the user
    last_name VARCHAR(100),                    -- Last name of the user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date and time the user was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Last update timestamp
);

    --comments table

    CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique ID for each comment
    user_id INT NOT NULL,                       -- Foreign Key referencing users table
    post_id INT NOT NULL,                       -- Assuming comments are related to some post
    comment_text TEXT NOT NULL,                 -- The actual comment text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the comment was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Timestamp when the comment was last updated
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- Foreign key relationship with the users table
);
    `,
    outputType : z.object({
        sqlQuery : z.string().optional().describe('sql query')
    }),
    outputGuardrails : [sqlGuardrail]
})

async function main(query=""){
    const result = await run(sqlAgent, query);
    console.log(`Query : ${result.finalOutput.sqlQuery}`)
}

main('Delete all the users and comments?')