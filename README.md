## url-shortener

### Description
This is a backend focused project made with Typescript, Express, Postgres, with Zod validation using Drizzle ORM. This project is a url-shortener project which takes short code and target url and assigns the short code and redirects to the target url when we `GET` to the short code. This project has two tables, `users` and `urls`, where `users` stores the user details, and `urls` stores the url details (about short code and target url). Authentication is done through jwt.

### Routes

- `health` - Health route
- `/user/signup`- Registers a new user
- `/user/login`- Logs in a existing user
- `/user/update`- Updates the `firstname` and `lastname` of the user.(Secure route)
- `/user/delete`- Deletes the user.(Secure route)
<br></br>
- `/shorten` - Shortens the url that is being given in the `req.body`. (Secure route)
- `/codes` - Gets all the code from a particular user. (Secure route)
- `/update`- Updates the target url of created short code by a user. (Secure route)
- `/:code` - Deletes a particular code. (Secure route)
- `/:shortCode`- Redirects to the target url.

### Installation
Clone the repository: 

```bash
git clone https://github.com/tausiq2003/bp-1-url-shortener
```
Move to the folder and create `.env` according to `.env.example`:
```bash
cd bp-1-url-shortener
touch .env
```
Install dependencies:

```bash
npm install
```
Run in dev mode:

```bash
npm run dev
```
OR
<br></br>
Using docker:
```bash
docker compose up -d
```


