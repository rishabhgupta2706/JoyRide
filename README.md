# JoyRide - AI-Powered Bike Rental Platform

JoyRide is a full-stack bike rental platform built using the MERN stack. It allows users to browse bikes, check availability, make bookings, manage their bookings, and receive personalized bike recommendations using AI.

The application also includes an admin panel for managing bikes, users' bookings, and booking statuses.

## Live Demo

https://joy-ride-eight.vercel.app

## GitHub Repository

https://github.com/rishabhgupta2706/JoyRide

---

## Features

### User Features

- User registration and login
- JWT-based authentication
- Browse available bikes
- Search and filter bikes
- View detailed bike information
- Check bike availability
- Book bikes for selected dates
- Calculate booking price
- View personal booking history
- Cancel bookings
- AI-powered bike recommendations
- Natural-language recommendation requests

### Admin Features

- Secure admin authentication
- Admin dashboard with statistics
- Add new bikes
- Upload bike images
- Update bike information
- Delete bikes
- View all bookings
- Manage booking status
- Monitor rental activity

### AI Features

JoyRide includes an AI-powered recommendation system that understands natural-language requests.

For example:

> I want a comfortable bike for a 2-day trip under ₹1500.

The system analyzes the user's requirements and recommends suitable bikes based on factors such as:

- Budget
- Rental duration
- Bike characteristics
- User requirements
- Bike availability

The recommendation system also provides explanations for why a bike was recommended.

---

## Tech Stack

### Frontend

- React.js
- React Router
- Axios
- Vite
- CSS

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### Image Management

- Cloudinary

### AI

- Ollama
- Local AI model integration
- AI-powered recommendation service

### Deployment

- Vercel - Frontend
- Render - Backend
- MongoDB Atlas - Database
- Cloudinary - Image storage

---

## System Architecture

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │      Vercel         │
                         └──────────┬──────────┘
                                    │
                              REST API / Axios
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │       Render        │
                         └──────┬──────┬───────┘
                                │      │
                     ┌──────────┘      └──────────┐
                     ▼                            ▼
          ┌─────────────────────┐       ┌─────────────────────┐
          │   MongoDB Atlas     │       │    AI Service       │
          │      Database       │       │      Ollama         │
          └─────────────────────┘       └─────────────────────┘
                               
                         ┌─────────────────────┐
                         │     Cloudinary      │
                         │    Bike Images      │
                         └─────────────────────┘