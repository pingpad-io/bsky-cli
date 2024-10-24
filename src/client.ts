import { AtpAgent } from "npm:@atproto/api";
import { CredentialManager } from "./creds.ts";

export class BlueskyClient {
	private agent: AtpAgent;
	private credManager: CredentialManager;

	constructor() {
		this.agent = new AtpAgent({ service: "https://bsky.social" });
		this.credManager = new CredentialManager();
	}

	async login(identifier?: string, password?: string) {
		if (!identifier || !password) {
			const creds = await this.credManager.loadCredentials();
			
			if (!creds) {
				throw new Error("No credentials found. Please run `bsky login` first.");
			}

			const response = await this.agent.login({
				identifier: creds.identifier,
				password: creds.password,
			});
			
			if (!response.success) {
  			throw new Error("Login failed");
			}
			return;
		}
	}

	async saveCredentials(identifier: string, password: string) {
		await this.credManager.saveCredentials(identifier, password);
	}

	async post(text: string) {
		await this.agent.post({
			text,
			createdAt: new Date().toISOString(),
		});
	}
}