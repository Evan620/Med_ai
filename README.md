# MedNote AI - Intelligent Medical Note-Taking Platform

MedNote AI is a comprehensive medical education platform that combines AI-powered analysis with intuitive note-taking tools, designed specifically for medical students, residents, and healthcare professionals.

## Features

- **AI-Powered Medical Analysis**: Get expert insights from Dr. Sarah Mitchell, our AI medical consultant
- **Smart Note Taking**: Create, organize, and enhance medical notes with AI suggestions
- **PDF Integration**: Upload medical textbooks and research papers for AI-powered analysis
- **YouTube Video Analysis**: Analyze medical educational videos and generate comprehensive summaries
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Customizable interface with theme preferences

## Project info

**URL**: https://lovable.dev/projects/e8189f02-8695-42c6-b9e5-61c1b66e4a1e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e8189f02-8695-42c6-b9e5-61c1b66e4a1e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure AI API (Optional)
# Copy the environment template
cp .env.example .env.local
# Edit .env.local and add your OpenRouter API key
# Get your API key from: https://openrouter.ai/keys

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## AI Configuration

MedNote AI uses OpenRouter for AI-powered medical analysis. The application works in demo mode without an API key, but for full functionality:

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Copy `.env.example` to `.env.local`
3. Replace `your-api-key-here` with your actual API key
4. Restart the development server

**Note**: The application will automatically fall back to demo mode if no valid API key is provided.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e8189f02-8695-42c6-b9e5-61c1b66e4a1e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
