# ApplyTrack

**ApplyTrack** is a modern job application tracking platform designed to help users organize their applications, monitor progress, and improve their CV with AI-powered feedback.

🌐 **Live Demo:** https://www.applytrack.dev

## Features

* 📊 **Application Dashboard**

  * Track total applications
  * Monitor interviews, offers, rejections, and saved jobs
  * View application status distribution and success rates

* 💼 **Job Application Management**

  * Create, edit, and delete job applications
  * Track company, position, location, application date, and status
  * Search and filter applications by status
  * Add notes, job links, and follow-up dates

* 📱 **Responsive Design**

  * Fully responsive desktop and mobile interface
  * Mobile-friendly application cards and navigation
  * Progressive Web App support

* 📄 **CV Management**

  * Upload and manage a PDF resume
  * View the uploaded CV directly inside the application
  * Single-resume workflow for a simple user experience

* 🤖 **AI-Powered CV Review**

  * Analyze resumes using OpenAI
  * Receive an overall CV score
  * Identify strengths and improvement areas
  * Get actionable suggestions
  * Cached analysis prevents unnecessary repeated AI requests

* 🔐 **Authentication**

  * User registration and login
  * JWT-based authentication
  * User-specific application and resume data

## Tech Stack

### Frontend

* Angular
* TypeScript
* Tailwind CSS
* RxJS
* PDF.js
* PWA / Service Worker

### Backend

* NestJS
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* PDF parsing

### AI

* OpenAI API
* AI-powered resume analysis

### Deployment

* **Frontend:** AWS Amplify
* **Backend:** Railway
* **Database:** MongoDB Atlas

## Application Flow

```text
User
 ├── Register / Login
 ├── Dashboard
 │    ├── Application Statistics
 │    ├── Status Overview
 │    └── Latest Activity
 │
 ├── Applications
 │    ├── Add Application
 │    ├── Edit Application
 │    ├── Delete Application
 │    └── Search / Filter
 │
 └── CV Review
      ├── Upload Resume
      ├── View Resume
      ├── Run AI Review
      └── View Score & Suggestions
```

## Application Statuses

Applications can currently be tracked with the following statuses:

* `Saved`
* `Applied`
* `Interview`
* `Offer`
* `Rejected`

## CV Review

ApplyTrack includes an AI-assisted CV review system focused on improving the overall quality of a resume rather than matching it against a specific job posting.

The review can provide:

* Overall CV score
* Key strengths
* Detected issues
* Severity levels
* Section-specific feedback
* Actionable improvement suggestions

Resume analysis results are cached based on the uploaded CV content, helping reduce unnecessary AI requests when the same resume is reviewed again.

## Architecture

```text
Angular Frontend
       │
       │ REST API
       ▼
NestJS Backend
       │
       ├── MongoDB Atlas
       │
       ├── Resume Storage
       │
       └── OpenAI API
```

## Local Development

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB or access to MongoDB Atlas

### Clone the Repository

```bash
git clone <repository-url>
cd apply-track
```

### Install Dependencies

Install frontend and backend dependencies from their respective directories.

```bash
npm install
```

### Environment Variables

The backend requires environment variables similar to:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=your_openai_api_key

FRONTEND_URL=http://localhost:4200
```

Never commit production secrets or `.env` files to the repository.

### Run the Application

Start the backend:

```bash
npm run start:dev
```

Start the Angular frontend:

```bash
ng serve
```

The frontend will normally be available at:

```text
http://localhost:4200
```

## Production

The production version of ApplyTrack is available at:

### 🚀 [www.applytrack.dev](https://www.applytrack.dev)

## Future Improvements

Some possible future additions include:

* AI-assisted application insights
* Job description and CV matching
* Advanced application analytics
* Follow-up reminders
* Interview tracking
* Email notifications
* Improved AI resume recommendations
* Mobile application support
* Exportable application reports

## Project Purpose

ApplyTrack was built as a full-stack project to combine practical job-search management with modern web technologies and AI capabilities.

The project demonstrates experience with:

* Frontend architecture with Angular
* REST API development with NestJS
* MongoDB data modeling
* Authentication and authorization
* Responsive UI development
* File upload and PDF processing
* AI API integration
* Cloud deployment

## License

This project is currently intended for personal and portfolio use.
