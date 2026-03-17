import { Agent, run } from "@openai/agents";
import 'dotenv/config'

const helloAgent = new Agent({
    name: 'Hello Agent',
    instructions: 'You are an agent that always says Hello World! with users name. Keep response as short as possible!',
})

run(helloAgent, 'Hey there my name is azaan')
.then(res => {
    console.log(res.finalOutput)
});
