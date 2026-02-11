# Senti-Vox Frontend

The beautiful, responsive web interface for Senti-Vox, built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

<div align="center">

[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

</div>

## 📂 Folder Structure

This directory contains the Next.js application source code.

| Directory         | Description                                            |
| :---------------- | :----------------------------------------------------- |
| **`app/`**        | The App Router directory containing pages and layouts. |
| **`components/`** | Reusable UI components.                                |
| **`lib/`**        | Utility functions, helpers, and types.                 |
| **`network/`**    | API clients and data fetching logic (Redis, Supabase). |
| **`public/`**     | Static assets like images and fonts.                   |

## 🛠️ Technologies Used

- **[Bun](https://bun.sh)**: Used as the package manager and runtime.
- **[Next.js 16](https://nextjs.org)**: Latest version of the React framework.
- **[React 19](https://react.dev)**: Leveraging latest React features.
- **[Tailwind CSS v4](https://tailwindcss.com)**: For styling and design system.
- **[Lucide React](https://lucide.dev)**: For the icon set.
- **[Supabase](https://supabase.com)**: Provides authentication and backend services.
- **[Resend](https://resend.com)**: Email service integration.

## ⚡ Getting Started

### Prerequisites

- **Bun**: Ensure you have [Bun](https://bun.sh) installed.

### Installation

```bash
# Navigate to the site directory
cd site

# Install dependencies
bun install
```

### Environment Setup

Create a `.env` file in the root of the `site` directory and populate it with the following keys (Supabase URL, Resend, Redis, etc.).
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_CONNECTION_STRING=
FREE_TOKEN_PASSWORD=
AUTH_EMAIL=
AUTH_EMAIL_PASSWORD=
```

### Development

To start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
