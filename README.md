# JobHive

JobHive is a job marketplace built using the MERN stack (MongoDB, Express.js, React, and Node.js). It connects job seekers with employers, allowing employers to post job listings and for job seekers to apply for positions easily.

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

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

CLIENT_URL=http://localhost:3000
NODE_ENV=development

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email_from_name
```

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
