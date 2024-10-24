import { RichText } from "@atproto/api";
import { Command } from "@cliffy/command";
import { Input, Secret } from "@cliffy/prompt";
import { BlueskyClient } from "./client.ts";

import { tty } from "@cliffy/ansi/tty";
import { keypress } from "@cliffy/keypress";

async function createInteractivePost(): Promise<string> {
	let text = "";
	console.log("\x1B[2J\x1B[0;0H"); // Clear screen
	console.log(
		`Your post [${text.length}/300] (Enter to submit, Esc to cancel):`,
	);
	console.log(text);

	for await (const event of keypress()) {
		if (event.key === "escape") {
			return "";
		}
		if (event.key === "return") {
			return text;
		}
		if (event.key === "backspace") {
			text = text.slice(0, -1);
		} else if (event.key?.length === 1 || event.key === "space") {
			text += event.key;
		}

		console.log("\x1B[2J\x1B[0;0H"); 
		console.log(
			`Your post [${text.length}/300] (Enter to submit, Esc to cancel):`,
		);
		console.log(`> ${text}`);
	}

	return text;
}

const client = new BlueskyClient();

await new Command()
	.name("bsky")
	.version("1.0.0")
	.description("Simple Bluesky CLI tool")
	.command("login", "Save Bluesky credentials")
	.action(async () => {
		const identifier = await Input.prompt("Enter your handle");
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
	.action(async () => {
		try {
			await client.login();
			const text = await createInteractivePost();

			if (!text) {
				console.log("Post cancelled");
				return;
			}

			const rt = new RichText({ text });
			await rt.detectFacets(client.agent);

			await client.post({
				text: rt.text,
				facets: rt.facets,
			});
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
