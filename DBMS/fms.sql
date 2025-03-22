CREATE DATABASE fms
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

Create Table Users
(
User_ID varchar(12) primary key,
UserName varchar(100) not null,
Email varchar(50) not null,
Building varchar(20),
RoomNo varchar(20),
UserPassword varchar(50) not null
);

Create Table Services
(
Service_ID BIGSERIAL primary key not null,
Service_Type varchar(30) not null
);

Create table Worker
(
Worker_ID bigserial not null primary key,
Name varchar(255) not null,
Phone_no bigint not null,
worker_service_id bigserial  REFERENCES Services(service_id),
Date_of_joining DATE not null,
Rating numeric(3,2),
WorkerPassword varchar(50) not null
);

Create table Fms_Admin
(
Admin_ID bigserial not null primary key,
password varchar(32) not null
);

Create table Complaints
(
Complaint_ID bigserial not null primary key,
Complaint varchar(255),
Complaint_dateTime timestamp(0)
);

create table Orders
(
Order_ID BIGSERIAL not null,
Collected boolean not null,
Location varchar(50) not null,
User_ID varchar(12)  not null references Users(User_ID),
Worker_ID bigserial not null references Worker(Worker_ID),
primary key(Order_ID)
);

Create table requests
(
User_ID varchar(12)  not null references Users(User_ID),
Worker_ID bigserial not null  references Worker(Worker_ID),
Service_ID BIGSERIAL  not null references Services(Service_ID),
building varchar(20) not null ,
room_no varchar(20) not null ,
feedback varchar(255) ,
is_completed boolean not null ,
request_time timestamp(0) not null,
primary key(User_ID,Worker_ID,Service_ID)
);

Create table files
(
Complaint_ID bigserial not null  references Complaints(Complaint_ID),
User_ID varchar(12) not null references Users(User_ID),  
Admin_ID bigserial not null references Fms_Admin(Admin_ID),
is_resolved boolean not null ,    
primary key(Complaint_ID)        
);

create table assigns
(
Service_ID BIGSERIAL not null references Services(Service_ID),
Admin_ID bigserial not null  references Fms_Admin(Admin_ID),
Worker_ID bigserial not null  references Worker(Worker_ID),
Assigned_Time timestamp(0) not null,
Assigned_Location varchar(50) not null ,
primary key(Service_ID,Admin_ID,Worker_ID,Assigned_Time,Assigned_Location)
);

COPY Users
FROM '/Users/teo/Desktop/sql/fms/users.csv'
WITH (FORMAT CSV, HEADER)

COPY worker
FROM '/Users/teo/Desktop/sql/fms/worker.csv'
WITH (FORMAT CSV, HEADER)

COPY services
FROM '/Users/teo/Desktop/sql/fms/services.csv'
WITH (FORMAT CSV, HEADER ON)

COPY fms_admin
FROM '/Users/teo/Desktop/sql/fms/fms_admin.csv'
WITH (FORMAT CSV, HEADER ON)

COPY complaints
FROM '/Users/teo/Desktop/sql/fms/complaints.csv'
WITH (FORMAT CSV, HEADER ON)

COPY fms_admin
FROM '/Users/teo/Desktop/sql/fms/order.csv'
WITH (FORMAT CSV, HEADER ON)

COPY requests
FROM '/Users/teo/Desktop/sql/fms/requests.csv'
WITH (FORMAT CSV, HEADER ON)

COPY files
FROM '/Users/teo/Desktop/sql/fms/files.csv'
WITH (FORMAT CSV, HEADER ON)

COPY assigns
FROM '/Users/teo/Desktop/sql/fms/assigns.csv'
WITH (FORMAT CSV, HEADER ON)


