## Wearable-Project
Steps to set up the project in order:

1. Install the Fitbit and Withings apps on your mobile phone and create accounts in them.
2. Add the devices to the mobile apps
3. Use the devices to generate real data.
4. Check if the backend server is up to receive data from the devices through OAuth 2.0 protocol and API.
The backend server is:  
hnc.evl.uic.edu
You need your own credentials to connect to this server.

(how to set up django - https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu )

The path to the backend code is:  
/var/www/withings

The connection between our backend and frontend is with Rest API, and all APIs are defined in this file:
/var/www/withings/website/views.py
You can add more APIs if you need them. All data related to APIs can be found on Fitbit and Withings developer API documents on their websites.

After making any changes to the code on that server, run the following command:  
"sudo systemctl restart gunicorn"

If you get gunicorn not found error, install gunicorn
"sudo apt install gunicorn"

Here is the link to the Django admin panel for managing users of the web application and their privileges:  
https://hnc.evl.uic.edu/admin/
adminhnc is the superuser or admin user on this panel. In the user section of this application, you can view all users who have access to the authentication panel. Additionally, there are options to edit existing users or add new users with different privileges.

The authentication panel can be accessed at the following address:  
https://hnc.evl.uic.edu

You can log in to this panel with the username and password provided in the previous step.

After logging in to the authentication panel, you will have two options: Connect to Withings and Connect to Fitbit. After selecting either option, you must authenticate with your desired Withings or Fitbit account, which should already be registered in the first step.

After connecting to both wearable devices, you can run the frontend code using the following commands:  
"npm i"
"npm run dev"

The web application's front end is the main interface, displaying various diagrams based on data from Withings and Fitbit.

The first three diagrams are from Withings and display weight and body composition data. The remaining three diagrams are from Fitbit and show sleep, activity, and other factors like SpO2, heart rate, etc.


fitbit developer 
https://dev.fitbit.com/login

withings developer
https://developer.withings.com