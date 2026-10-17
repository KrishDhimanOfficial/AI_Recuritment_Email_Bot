![alt text](<Screenshot 2026-07-06 at 7.28.50 PM.png>)

![alt text](<Screenshot 2026-10-11 at 4.16.17 PM.png>)

<div align="center">
  <br />
  <div style="background: linear-gradient(to top right, #312e81, #1e1b4b); padding: 20px; border-radius: 12px; display: inline-block;">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
  
  <h1 align="center">RecruitFlow AI</h1>
  <p align="center">
    <strong>Automate Talent Outreach Instantly</strong>
  </p>
</div>

<br />

> Engage candidate pipelines with high-context, ultra-personalized emails generated dynamically. Experience the future of intelligent candidate sourcing.

## 🌟 Overview

**RecruitFlow AI** is a cutting-edge recruitment automation tool built on the MERN stack (MySQL/PostgreSQL, Express, React/Next.js, Node.js). It seamlessly integrates with your corporate Google Workspace to manage email outreach, leveraging the power of **Google Gemini AI** to draft ultra-personalized, context-aware emails for prospective candidates.

## ✨ Features

- **Automated Outreach**: Intelligent cron jobs to schedule and send emails exactly when they matter.
- **AI-Powered Personalization**: Integrated with Google's Gemini API to generate tailored candidate emails.
- **Seamless Authentication**: Secure login via NextAuth and Google OAuth Identity Services.
- **Candidate Pipeline Management**: Organize and track your sourcing pipelines.
- **Beautiful Modern UI**: A sleek, responsive dashboard built with Next.js and Tailwind CSS.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, NextAuth.js
- **Backend**: Node.js, Express.js
- **Database**: Sequelize ORM (MySQL / PostgreSQL)
- **AI & Integrations**: Google Gemini API, Nodemailer, Mailparser, Google APIs

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL or PostgreSQL database
- Google Cloud Console account (for OAuth and Gemini API keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KrishDhimanOfficial/AI_Recuritment_Email_Bot.git
   cd AI_Recruitment_Email_Bot
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure Environment Variables**
   - In the `server` directory, configure your `.env` file with database credentials, Gemini API key, and SMTP details.
   - In the `client` directory, configure your `.env` file with your Google Client ID, Secret, and NextAuth credentials.

4. **Run the Application**
   From the `server` directory, run:
   ```bash
   npm run dev
   ```
   This will concurrently start both the Express backend and the Next.js frontend!

## 🔒 Security

All connections are securely managed by Google OAuth Identity Services. We do not store plain-text passwords for corporate accounts.

----

<p align="center">
  <small>© 2026 RecruitFlow. All rights reserved.</small>
</p>