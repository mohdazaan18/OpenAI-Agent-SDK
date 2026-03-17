import "dotenv/config"
import {OpenAI} from "openai"

const client = new OpenAI();

client.conversations.create({}).then(e => {
    console.log(`Conv thread create ${e.id}`)
})