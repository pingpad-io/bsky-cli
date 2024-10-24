import { AtpAgent, type RichText } from "npm:@atproto/api";
import { CredentialManager } from "./creds.ts";

export interface PostOptions {
	text: string;
	facets?: RichText["facets"];
}

export class BlueskyClient {
	public agent: AtpAgent;
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

	async post(options: PostOptions | string) {
		const postOptions =
			typeof options === "string" ? { text: options } : options;

		await this.agent.post({
			text: postOptions.text,
			facets: postOptions.facets,
			createdAt: new Date().toISOString(),
		});
	}
}
