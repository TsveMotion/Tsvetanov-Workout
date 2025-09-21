The Tsvetanov Workout - Database Version
This is a full-stack web application with an HTML/JavaScript frontend and a Node.js/SQLite backend.

How to Run This Application
Follow these steps to get the application running on your local machine.

Prerequisites
You must have Node.js installed on your computer. You can download it from nodejs.org.

Step 1: Download the Files
Download all the files I provided and place them together in a new, empty folder. Your folder should contain:

workout_dashboard.html

server.js

package.json

Step 2: Install Dependencies
Open your computer's terminal or command prompt.

Navigate to the folder where you saved the files. For example:

cd path/to/your/folder

Run the following command to install the necessary backend packages:

npm install

This will read the package.json file and download Express, SQLite3, and CORS into a node_modules folder.

Step 3: Start the Backend Server
In the same terminal window, run this command:

node server.js

You should see a message that says Server running on http://localhost:3000 and Connected to the SQLite database.. This means your backend is running and has created a database.db file to store your data.

Keep this terminal window open. Closing it will stop the server.

Step 4: Open the Application
Go back to your folder.

Open the workout_dashboard.html file in your web browser (you can usually just double-click it).

The application should now be fully functional. Any data you log will be sent to your local server and saved permanently in the database.db file.