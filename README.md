# 💼 Resume Tailor – Nexium Grand Project

A dynamic, clean, and user-friendly resume builder web app built with Next.js 15, TypeScript, and Tailwind CSS. This project allows users to create, customize, and download professional resumes with real-time previews and multiple templates. It was developed as part of the Grand Project for the Nexium Internship.


---

## 🚀 Features

✍️ Interactive form to add personal details, work experience, education, and skills

🎨 Multiple resume templates with unique styling

👁️ Real-time live preview while filling in details

📄 PDF export for professional download

📋 Copy-to-clipboard support

🔄 Reset functionality to clear all fields quickly

🌗 Light/Dark mode toggle (system preference supported)

📱 Fully responsive design for desktop & mobile

🎉 Smooth animations, hover effects, and notifications



---

## 🛠️ Tech Stack

Framework: Next.js 15 (App Router)

Language: TypeScript

Styling: Tailwind CSS, ShadCN UI

Icons: Lucide Icons

PDF Generation: jsPDF

Notifications: react-toastify

Deployment: Vercel



---

## 🔗 Live Demo (Vercel)

👉 [Click here to view the deployed site 🚀](https://nexium-marium-abid-grand-project.vercel.app/)


---

## 📂 Folder Structure

resume-tailor-dashboard/
│
├── public/                # Static assets (images, icons, favicon, etc.)
├── src/                   # Source code
│   ├── app/               # Next.js app directory
│   │   ├── dashboard/     # Resume builder pages
│   │   ├── api/           # API routes (if any)
│   │   ├── page.tsx       # Main landing page
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Global styles
│   │
│   ├── components/        # UI components
│   │   └── ui/            # Reusable components (Button, Input, PDFViewer, etc.)
│   │
│   ├── lib/               # Utility functions
│   └── prisma/            # Prisma schema/config (if used)
│
├── .env.local             # Environment variables (ignored in Git)
├── components.json        # ShadCN config
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies & scripts
├── pnpm-lock.yaml         # Dependency lockfile
├── postcss.config.js      # PostCSS config
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
