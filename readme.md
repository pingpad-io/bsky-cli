**what?**

a simple [bluesky](https://bsky.app) cli interface

**how?**
1. To login, run
```
bsky login
```
You'll be prompted to login with your login and app-password.

2. To post a message, run

```
bsky post "boop"
```

TODO: package into a binary, right now you run it as
```
deno run -A main.ts post "boop from cli"
```
