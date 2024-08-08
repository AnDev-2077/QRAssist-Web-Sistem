# QR Assist

QRAssist is a comprehensive solution for managing student attendance using QR technology. Each student is assigned a QR code, which can be their ID, easily scanned through a QR scanning application that is also part of the system. The scanned data is automatically transferred to a MySQL database through a secure API.

The QRAssist web application allows administrators to view attendance statistics clearly, grouped by week, month, and day. Additionally, the system offers the functionality to load large student data sets via an Excel file and also facilitates exporting this data in the same format.

The web system also allows for editing each student's information, such as their name or section, ensuring that the information is always up to date. Furthermore, QRAssist integrates an advanced search feature that makes it easy to quickly locate any student in the database.

As an additional feature designed for flexible data management, QRAssist includes a button that allows the attendance database to be cleared after one year, meeting the requirements of institutions that do not consider this data to be relevant in the long term.

QRAssist simplifies attendance management, improves efficiency in handling student data, and ensures precise and accessible control.
## Installation
### Dowload
- Dowload and install VS Code
- Dowload and install MySQL
- Dowload and install NodeJS
### Clone
- Clone the web sistem repository
- Clone the API repository [RestAPI](https://github.com/AnDev-2077/RestAPI-DB.git)
### DataBase
- Create the database whit

```sql
CREATE TABLE alumnos
(
    Codigo_QR     INT          NOT NULL
        PRIMARY KEY,
    nombre        VARCHAR(255) NULL,
    apellido      VARCHAR(255) NULL,
    edad          INT          NULL,
    seccion       VARCHAR(255) NULL,
    ciclo         VARCHAR(255) NULL,
    carrera_curso VARCHAR(255) NULL,
    turno         VARCHAR(255) NULL
);

CREATE TABLE estados
(
    id_estado INT AUTO_INCREMENT
        PRIMARY KEY,
    nombre    VARCHAR(255) NULL
);

CREATE TABLE asistencia
(
    id_asistencia INT AUTO_INCREMENT
        PRIMARY KEY,
    qr_alumno     INT                                 NULL,
    id_estado     INT                                 NULL,
    fecha         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT asistencia_ibfk_1
        FOREIGN KEY (qr_alumno) REFERENCES alumnos (Codigo_QR),
    CONSTRAINT asistencia_ibfk_2
        FOREIGN KEY (id_estado) REFERENCES estados (id_estado)
);

CREATE INDEX id_estado
    ON asistencia (id_estado);

CREATE INDEX qr_alumno
    ON asistencia (qr_alumno);
```
### Conection 
Once you have cloned the web system repository, find the file named keys and update the parameters according to your database. The file should look like this:
```js
module.exports={
    database:{
        host: 'yourlocalhost',
        user: 'root', 
        password: 'yourpassword',
        database: 'yourdatabase'
    }
};
```
Now, in the REST API project, find the .env file and update the parameters according to your database. The file should look like this:
```js
DB=yourdatabase
DB_HOST=yourlocalhost
DB_USER=root
DB_PASS=yourpassword
```

    
## Deployment

Once the previous steps have been completed, perform a test to ensure that the system is working correctly. Follow these steps:

To run the Rest API, use the command:
```bash
  node app.js
```
Then, to run the web system, use the command:
```bash
  npm run dev
```
If everything is working, both the **Rest API** and the **Web System** should be running on ports **3000** and **7000**, respectively.
## Roadmap

- Additional browser support

- Add more integrations

