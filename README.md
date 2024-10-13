# JobHive

JobHive is a job marketplace built using the MERN stack (MongoDB, Express.js, React, and Node.js). It connects job seekers with employers, allowing employers to post job listings and for job seekers to apply for positions easily.

## Features

JobHive includes several key features:

### User Management

- **Sign-Up**: New users can register with their email and password.
- **Log-In**: Returning users can access their accounts using their email and password.
- **Reset Password**: Users can reset their account password by receiving an unique link in their email.

### Job Listing Functionalities

- **Create Company Profile**: Employers can set up and complete a company profile.
- **Create Job Listing**: Employers can create and publish job listings.
- **Edit Job Listing**: Employers can update existing job listings.
- **Browse Job Listings**: Job seekers can view available job listings.
- **Apply for Jobs**: Job seekers can apply directly through the platform.

### Basic User Interaction

- **View Job Listings**: Job seekers can access detailed job listings.
- **Application Status**: Users can check the status of their job applications.
- **Browse Employers**: Users can browse employer profiles.
- **User Profiles**: Users can create a profile to show their personal details. These include experience, education and skills. Users can upload their resume to make it easier for employers to evaluate.

### Additional Features

- **Messages**: Real-time messaging for effective communication between users.
- **Notifications**: Alerts for job applications and new messages.
- **Interview Questions Improver**: AI-driven suggestions for enhancing interview questions.
- **AI Job Insights for Employers**: Tailored insights for effective job postings.
- **CV Analysis / Feedback**: Employers can analyze CVs and provide feedback.
- **Pre-Determined Questions with AI Ratings**: Rated questions to improve interview quality.
- **Payments**: Integrated payment systems for subscriptions and service fees.
- **Company and User Reviews**: Feedback systems for both companies and users.
- **Q&A Section**: A platform for users to ask and answer questions.
- **Recommended Jobs**: Personalized job recommendations based on user profiles.
- **User Posts**: A feature allowing users to create posts visible to others.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install the necessary packages.

## Backend

1. Clone the repository:

```bash
https://github.com/JaskarnChohan/JobMarketplace.git
cd JobMarketplace/server
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the backend directory and add the following environment variables:

```
MONGO_URI=your_mongodb_connection_string    # MongoDB connection string (get from MongoDB Atlas)
JWT_SECRET=your_jwt_secret                  # Secret key for JWT (generate a secure random string)
JWT_EXPIRE=30d                              # Expiration time for JWT
JWT_COOKIE_EXPIRE=30                        # Expiration time for cookies

CLIENT_URL=http://localhost:3000            # URL for the frontend application
NODE_ENV=development                        # Environment mode (development/production)

EMAIL_USER=your_email_address               # Email for sending notifications (use a dedicated email account)
EMAIL_PASS=your_email_password              # Password for the email account (use an app-specific password)
EMAIL_FROM=Your App Name                    # Display name for email sender

GOOGLE_AI_API_KEY=your_google_api_key       # API Key for Google AI services (obtain from Google Cloud Console)

PAYPAL_CLIENT_ID=your_paypal_client_id      # PayPal Client ID (get from PayPal Developer Dashboard)
PAYPAL_SECRET=your_paypal_secret            # PayPal Secret (get from PayPal Developer Dashboard)
PAYPAL_MODE=sandbox                         # Set to 'sandbox' for testing
```

Google AI services are used across the project for all AI tools. Paypal is the payment service used for subscriptions.

Markers can use the provided .env file on Trello to make it easier.

4. Start the backend server:

```bash
npm start
```

## Frontend

1. Open a new terminal window and navigate to the frontend directory:

```bash
cd JobMarketplace/client
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend application:

```bash
npm start
```

## Usage

Once both the backend and frontend servers are running, you can access the JobHive marketplace at [http://localhost:3000](http://localhost:3000). Users can:

    •	Job Seekers: Create an account, browse job listings, browse employers and apply for jobs.
    •	Employers: Create job listings, review applications, and manage candidates.

## Authors

    •	Jaskarn - JaskarnChohan
    •	Ishaan - pillaypower
    •	Richard - Richardsanqc
    •	George - 5hiri
    •	William - WilliamAUT
