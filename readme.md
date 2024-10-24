**what?**

a simple [bluesky](https://bsky.app) cli interface

**how?**

0. to install (or update), run:
```sh
deno install --allow-all --global -f --name bsky \
    --import-map https://raw.githubusercontent.com/pingpad-io/bsky-cli/refs/heads/main/import.json \
    https://raw.githubusercontent.com/pingpad-io/bsky-cli/refs/heads/main/src/main.ts
```

1. to login, run:
```sh
bsky login
```

you'll be prompted to login with your login and app-password.


2. to post a message, run:
```sh
bsky post "boop"
```
