# 🌊 Windsurf - Modern File Storage Solution

<div align="center">

A sleek, secure, and user-friendly file storage application built with modern web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

## ✨ Features

- 🔒 **Secure Authentication** - User authentication powered by NextAuth.js
- 📁 **File Management** - Upload, download, and organize your files
- 🔍 **Smart Search** - Quick file search with real-time filtering
- 👀 **File Preview** - Built-in preview for images, PDFs, markdown, and text files
- 📱 **Responsive Design** - Seamless experience across all devices
- ⚡ **Real-time Updates** - Instant feedback on all file operations
- 🎨 **Modern UI** - Beautiful and intuitive user interface

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/hreis00/storage-bucket.git
   cd storage-bucket
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your environment variables in `.env.local`

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application

## 🛠️ Tech Stack

- **Frontend**

  - Next.js 15 (App Router)
  - TypeScript
  - Tailwind CSS
  - Heroicons
  - React Markdown

- **Backend**

  - Next.js API Routes
  - MongoDB
  - NextAuth.js

- **Development**
  - ESLint
  - Prettier
  - TypeScript

## 📝 Project Structure

```
storage-bucket/
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # Reusable React components
│   ├── lib/               # Utility functions and configurations
│   ├── types/             # Type definitions
│   └── models/            # MongoDB models
├── public/                # Static assets
└── ...configuration files
```
