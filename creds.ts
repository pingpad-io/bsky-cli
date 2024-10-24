import { decodeBase64, encodeBase64 } from "@std/encoding";
import { join } from "@std/path";

export class CredentialManager {
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
