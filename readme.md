**what?**

a simple [bluesky](https://bsky.app) cli interface

**how?**

0. To install, run
```sh
deno install --allow-all --name bsky --global --import-map imports.json -f ./src/main.ts
```

1. To login, run
```sh
bsky login
```
You'll be prompted to login with your login and app-password.

2. To post a message, run
```sh
bsky post "boop"
```
