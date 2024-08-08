## Wearable-Project
The backend server is:  
hnc.evl.uic.edu

The path to the backend code is:  
/var/www/withings

After making any changes to the code on that server, run the following command:  
## gunicorn systemctl restart`

Here is the link to the Django admin panel for managing users of the web application and their privileges:  
https://hnc.evl.uic.edu/admin/

In the user section of this application, you can view all users with access to the authentication panel. Additionally, there are options to edit existing users or add new users with different privileges.

The authentication panel can be accessed at the following address:  
https://hnc.evl.uic.edu

You can log in to this panel with the username and password provided in the previous step.

After logging in to the authentication panel, you will have two options: Connect to Withings and Connect to Fitbit. After selecting either option, you must authenticate with your desired Withings or Fitbit account, which should already be registered.

After connecting to both wearable devices, you can run the frontend code using the following commands:  
## npm i 
## npm run dev

The frontend of the web application is the main interface, displaying various diagrams based on data received from Withings and Fitbit.

The first three diagrams are from Withings and display weight and body composition data. The remaining three diagrams are from Fitbit and show sleep, activity, and other factors like SpO2, heart rate, etc.
