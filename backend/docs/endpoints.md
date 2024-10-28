# Shift Management Application - Refined Backend Specification

## API Endpoints

### Dashboard Overview

- **GET /dashboard/summary**
  - Returns quick stats (e.g., total shifts this month, upcoming vacations, employee attendance rates)
- **GET /dashboard/notifications**
  - Returns alerts for critical issues like understaffed shifts
- **GET /dashboard/recent-feedback**
  - Returns the latest anonymous remarks from employees

### Preferences

- **GET /preferences**
  - Returns a list of all preferences
- **POST /preferences**
  - Creates a new preference
- **GET /preferences/:id**
  - Returns a preference by ID
- **PUT /preferences/:id**
  - Updates a preference by ID
- **DELETE /preferences/:id**
  - Deletes a preference by ID
- **GET /preferences/user/:id**
  - Returns preferences for a specific user
- **GET /preferences/dates/:start_date/:end_date**
  - Returns preferences within a date range

### Schedule

- **GET /schedule**
  - Returns a list of all schedules
- **POST /schedule**
  - Creates a new schedule
- **GET /schedule/:id**
  - Returns a schedule by ID
- **PUT /schedule/:id**
  - Updates a schedule by ID
- **DELETE /schedule/:id**
  - Deletes a schedule by ID
- **GET /schedule/dates/:start_date/:end_date**
  - Returns schedules within a date range
- **GET /schedule/user/:id**
  - Returns schedules for a specific user

### Shift

- **GET /shift**
  - Returns a list of all shifts
- **POST /shift**
  - Creates a new shift
- **PUT /shift/:id**
  - Updates a shift by ID
- **DELETE /shift/:id**
  - Deletes a shift by ID
- **GET /shift/:id**
  - Returns a shift by ID
- **GET /shift/schedule/:id**
  - Returns shifts for a specific schedule ID
- **GET /shift/user/:id**
  - Returns shifts for a specific user ID
- **GET /shift/name/:name**
  - Returns shifts by name
- **GET /shift/date/:date**
  - Returns shifts by date
- **GET /shift/dates/:start_date/:end_date**
  - Returns shifts within a date range

### Users

- **GET /users**
  - Returns a list of all users
- **POST /users**
  - Creates a new user
- **GET /users/:id**
  - Returns a user by ID
- **PUT /users/:id**
  - Updates a user by ID
- **DELETE /users/:id**
  - Deletes a user by ID
- **GET /users/shift/:id**
  - Returns users for a specific shift ID

### Vacations

- **GET /vacations**
  - Returns a list of all vacations
- **POST /vacations**
  - Creates a new vacation
- **GET /vacations/:id**
  - Returns a vacation by ID
- **PUT /vacations/:id**
  - Updates a vacation by ID
- **DELETE /vacations/:id**
  - Deletes a vacation by ID
- **GET /vacations/user/:id**
  - Returns vacations for a specific user
- **GET /vacations/dates/:start_date/:end_date**
  - Returns vacations within a date range
- **GET /vacations/date/:date**
  - Returns vacations by date

### Feedback and Remarks

- **GET /feedback/anonymous**
  - Returns a list of anonymous remarks
- **GET /feedback/summary**
  - Returns summary charts of feedback trends over time

### Reports and Analytics

- **GET /reports/shift-fulfillment**
  - Returns graphs showing the percentage of fully staffed shifts over time
- **GET /reports/attendance**
  - Returns charts showing attendance rates, lateness, and absenteeism
- **GET /reports/ratings**
  - Returns average ratings for each shift
- **POST /reports/custom**
  - Allows for creating custom reports
- **GET /reports/trend-analysis**
  - Returns graphs showing trends in key metrics
- **GET /reports/heatmaps**
  - Returns heatmaps showing peak times for shift demand and employee availability

### User Settings

- **GET /users/settings**
  - Returns user profile and system settings
- **PUT /users/settings**
  - Updates user profile and system settings
- **POST /system/backup**
  - Initiates a system data backup
- **POST /system/restore**
  - Restores system data from a backup

## Role-Based Access Control (RBAC)

**Roles and Permissions:**

- **User:**

  - Access to personal preferences, profile settings, weekly schedule, and anonymous remarks.
  - Accessible Endpoints:
    - GET /preferences/user/:id
    - PUT /preferences/:id
    - GET /preferences/:id
    - GET /preferences/dates/:start_date/:end_date
    - GET /schedule/user/:id
    - GET /schedule/:id
    - GET /shift/user/:id
    - GET /shift/:id
    - GET /shift/name/:name
    - GET /shift/date/:date
    - GET /shift/dates/:start_date/:end_date
    - GET /vacations/user/:id
    - GET /vacations/date/:date
    - GET /vacations/dates/:start_date/:end_date

- **Manager:**

  - Additional access to find free employees in case of absences.
  - Accessible Endpoints:
    - All User endpoints
    - GET /users
    - GET /users/:id
    - GET /users/shift/:id

- **Supervisor:**

  - Additional access to modify existing schedules and change shifts.
  - Accessible Endpoints:
    - All Manager endpoints
    - PUT /schedule/:id
    - POST /shift
    - PUT /shift/:id
    - DELETE /shift/:id
    - POST /vacations

- **Chief:**

  - Additional access to edit any aspect of the application, approve/reject vacation requests, publish final schedules, read private and anonymous remarks, and change user roles.
  - Accessible Endpoints:
    - All Supervisor endpoints
    - POST /preferences
    - DELETE /preferences/:id
    - POST /schedule
    - DELETE /schedule/:id
    - PUT /users/:id
    - DELETE /users/:id
    - PUT /vacations/:id
    - DELETE /vacations/:id

- **Admin:**
  - Full access to all features and settings, including deleting history.
  - Accessible Endpoints:
    - All Chief endpoints
    - DELETE /history
