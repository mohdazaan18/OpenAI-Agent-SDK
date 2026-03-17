import "dotenv/config"
import { Agent, run } from "@openai/agents"
import { z } from "zod"

let sharedHistory = [];

const executeSQL = tool({
    name : "execute_sql",
    description : "This executes the sql query.",
    parameters : z.object({
        sql : z.string().describe('sql query')
    }),
    execute : async function ({sql}){
        console.log(`[SQL] : Execute ${sql}`);
        return 'done';
    }
})

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
    tools : [executeSQL],
})

async function main(query=""){
    //store message in history
    sharedHistory.push({role : "user", content: q})

    const result = await run(sqlAgent, sharedHistory);
    sharedHistory = result.history;

    console.log(result.finalOutput);
}

main('Get me all the users.')