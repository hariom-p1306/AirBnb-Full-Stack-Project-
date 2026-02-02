🏠 Airbnb Clone – Full Stack Booking Platform

A full-stack Airbnb-style web application where users can list properties, send booking requests, and manage bookings as hosts or guests.

This project focuses on real-world backend workflows, authentication, role-based access control, and MVC architecture.

🚀 Live Demo

🔗 https://airbnb-full-stack-project-e7eq.onrender.com/listings

⚠️ Note: Initial load may take a few seconds because the app is hosted on a free server.

🛠️ Tech Stack
Frontend

HTML

CSS

JavaScript

EJS (Embedded JavaScript Templates)

Bootstrap

Backend

Node.js

Express.js

MongoDB

Mongoose

Passport.js (Session-based Authentication)

External Services

Cloudinary (Image Uploads)

Google Maps API (Location Integration)

Render (Deployment)



## ✨ Key Features

- User Authentication (Signup / Login / Logout)
- Password hashing using Passport
- Session-based authentication
- Role-based access (Host & Guest)
- Create, Edit & Delete Property Listings
- Secure image upload with Cloudinary
- Booking Request System:
  - Guest sends booking request
  - Host can Accept / Reject
  - Booking status updates dynamically
- Guest & Host Dashboards
- Flash messages & form validation
- Search listings by city
- Advanced listing filters (price range, guest count, etc.)
- Secure routes using custom middleware
- MVC Architecture implementation
- Centralized error handling using custom utilities

## 🔍 Search & Filtering

Users can search for listings based on city name.  
Additionally, the application supports advanced filtering options — such as price range and number of guests — to refine results.

This enhances user experience and makes browsing listings more intuitive.



🧠 Application Architecture

This application follows the MVC (Model-View-Controller) pattern:

Models → Define MongoDB schemas (User, Listing, Booking, Review)

Routes → Handle request endpoints

Controllers (inside routes) → Manage business logic

Views → Render dynamic UI using EJS

Middleware → Protect routes & validate permissions

Utils → Centralized error handling & async wrappers

🔐 Authentication Flow

User registers or logs in

Password is securely hashed before storage

Passport Local Strategy verifies credentials

Session is created upon successful login

Session cookie maintains authentication state

Protected routes are accessible only to logged-in users

📁 Project Structure
airbnb/
│

├── public/ # Static files (CSS, JS)

├── routes/          # Express route handlers

├── views/           # EJS templates

├── middleware/      # Custom route protection logic

├── utils/           # Error handling & async wrapper

├── app.js           # Main server file

└── package.json


⚙️ Installation & Setup

Clone the repository

git clone https://github.com/hariom-p1306/AirBnb-Full-Stack-Project-


Install dependencies

npm install


Create a .env file and add:

MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=your_secret_key

GOOGLE_MAPS_API_KEY=your_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_KEY=your_key

CLOUDINARY_SECRET=your_secret


Run the server

npm start


Open in browser:

http://localhost:3000

🎯 Learning Outcomes

Implemented MVC architecture

Built secure authentication using Passport

Designed booking workflow logic

Managed relational data using MongoDB references

Handled image uploads in production

Deployed full-stack application to Render

📌 Future Improvements

Online payment gateway integration

Reviews & rating system

Wishlist feature

Advanced search & filtering

Performance optimization

👤 Author

Hariom Patel
LinkedIn: (https://www.linkedin.com/in/hariom-patel-dev)

Portfolio: https://portfolio-one-navy-20.vercel.app/
