# YAP Integration

This repository contains both the frontend (Next.js) and backend (Node.js) for the YAP project.

## Project Structure

- `yap-frontend-v2 copy/` — Next.js 15 frontend (React 19, TailwindCSS 4)
- `YAPBackend copy/` — Node.js backend (Express, ethers, etc.)

---

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/YAP-Technologies-Inc/yap-integration.git
cd yap-integration
```

### 2. Install dependencies

#### Backend

```sh
cd "YAPBackend copy"
npm install
```

#### Frontend

```sh
cd "yap-frontend-v2 copy"
npm install
```

---

### 3. Environment Variables

- **Do NOT commit your `.env` files.**
- `.env` files are already in `.gitignore` and will not be uploaded to GitHub.
- Place your `.env` files in the appropriate folders:
  - `YAPBackend copy/.env`
  - `yap-frontend-v2 copy/.env`

---

### 4. Running the Project

#### Backend

```sh
cd "YAPBackend copy"
node index.js
```

#### Frontend

```sh
cd "yap-frontend-v2 copy"
npm run dev
```

- The frontend will usually be available at [http://localhost:3000](http://localhost:3000)

---

## Git Usage

- Your `.env` files are protected by `.gitignore` and will not be uploaded.
- To commit and push changes:

```sh
git add .
git commit -m "Your message"
git push
```

- If you need to force push (overwrite remote):

```sh
git push -u origin main --force
```

**Warning:** This will overwrite the remote branch with your local branch.

---

## Notes

- If you see `Module not found: Can't resolve '@11labs/react'`, install it in the frontend:
  ```sh
  cd "yap-frontend-v2 copy"
  npm install @11labs/react
  ```
- For any issues, check the documentation or open an issue in this repo.

---

## License

[MIT](LICENSE)
