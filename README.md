# wise_assessment

### README

This repository contains code for a Node.js server that utilizes Express for API handling, MongoDB for database management, and various npm packages for authentication and token generation.

### Prerequisites
Before running the code, ensure you have the following installed:
- Node.js
- MongoDB

### Installation
1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.

### Setup
1. Install dependencies by running:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory and define the following environment variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/instructorDB
   ```

### Running the Server
To start the server, run the following command:
```
npm start
```

### API Endpoints
- **Register**: `POST /register`
- **Login**: `POST /login`
- **Check-in**: `POST /checkin`
- **Check-out**: `POST /checkout`
- **Monthly Report**: `GET /monthlyreport/:instructorId/:month/:year`

### Dependencies
- bcrypt: ^5.1.1
- express: ^4.18.2
- jsonwebtoken: ^9.0.2
- moment: ^2.30.1
- mongoose: ^8.1.2
- nodemon: ^3.0.3

### Assumptions
- This assumes a local MongoDB instance running on the default port (`27017`) and a database named `instructorDB`.
- No additional setup, such as seed data for the database, is required for basic functionality.
