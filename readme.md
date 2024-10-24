**what?**

a simple [bluesky](https://bsky.app) cli interface

**how?**

0. To install, run
```sh
deno install    \
    --allow-all \
    --name bsky \
    --global    \
    -f          \
    https://raw.githubusercontent.com/pingpad-io/bsky-cli/refs/heads/main/src/main.ts
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
