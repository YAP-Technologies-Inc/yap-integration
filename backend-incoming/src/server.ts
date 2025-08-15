import http from "http";
import app from "./app.js";
import { attachAgentBridge } from "./ws/agentBridge.js";
import "./config/env.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = http.createServer(app);


attachAgentBridge(server);

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`WS bridge at ws://localhost:${PORT}/api/agent-ws`);
});