import { AtpAgent } from "npm:@atproto/api";
import {
	Input,
	Secret,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { Command } from "@cliffy/command";
import { decodeBase64, encodeBase64 } from "@std/encoding";
import { join } from "@std/path";

class CredentialManager {
	private configFile: string;

	constructor() {
		const configDir = join(Deno.env.get("HOME") || "~", ".config", "bsky-cli");
		this.configFile = join(configDir, "credentials.json");
	}

	async saveCredentials(identifier: string, password: string) {
		await Deno.mkdir(new URL(".", `file://${this.configFile}`).pathname, {
			recursive: true,
		});
		const encoded = encodeBase64(JSON.stringify({ identifier, password }));
		await Deno.writeTextFile(this.configFile, encoded);
		await Deno.chmod(this.configFile, 0o600);
	}

	async loadCredentials(): Promise<{
		identifier: string;
		password: string;
	} | null> {
		try {
			const encoded = await Deno.readTextFile(this.configFile);
			return JSON.parse(new TextDecoder().decode(decodeBase64(encoded)));
		} catch {
			return null;
		}
	}
}

class BlueskyClient {
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
				throw new Error("No credentials found. Please login first.");
			}

			await this.agent.login({
				identifier: creds.identifier,
				password: creds.password,
			});
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

const client = new BlueskyClient();

await new Command()
	.name("bsky")
	.version("1.0.0")
	.description("Simple Bluesky CLI tool")
	.command("login", "Save Bluesky credentials")
	.action(async () => {
		const identifier = await Input.prompt("Enter your handle or email:");
		const password = await Secret.prompt("Enter your app password:");

		try {
			await client.login(identifier, password);
			await client.saveCredentials(identifier, password);
			console.log("Login successful! Credentials saved.");
		} catch (error) {
			if (error instanceof Error) {
				console.error("Login failed:", error.message);
			} else {
				console.error("Login failed with unknown error");
			}
			Deno.exit(1);
		}
	})
	.command("post", "Post to Bluesky")
	.arguments("<text:string>")
	.action(async (_options: unknown, text: string) => {
		try {
			await client.login();
			await client.post(text);
			console.log("Posted successfully!");
		} catch (error) {
			if (error instanceof Error) {
				console.error("Failed to post:", error.message);
			} else {
				console.error("Failed to post with unknown error");
			}
			Deno.exit(1);
		}
	})
	.parse(Deno.args);
