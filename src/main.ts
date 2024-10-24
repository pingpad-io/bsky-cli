import { Input, Secret } from "@cliffy/prompt";
import { RichText } from "@atproto/api";
import { Command } from "@cliffy/command";
import { BlueskyClient } from "./client.ts";

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
	.arguments("<text:string>")
	.action(async (_options: unknown, text: string) => {
		try {
			await client.login();
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
