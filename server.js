const express = require('express');
const path = require('path');
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbpath = path.join(__dirname, 'doctors.db');
const app = express();

app.use(express.json())

let db;

const initialiseDbAndServer = async () => {
    try{
        db = await open({
            filename: dbpath,
            driver: sqlite3.Database
        })

        app.listen(4000, () => {
            console.log('server has started on port 4000')
        })

    }catch(e){
        console.log(e.message);
        process.exit(1);
    }
}

initialiseDbAndServer()

const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

app.get('/', async(req, res) => {
    const {search_q} = req.query;
    if(hasSearchProperty(req.query)){
        const getData = `
        SELECT * FROM doctors
        WHERE name LIKE '%${search_q}%' OR 
        specialization LIKE '%${search_q}%'
        `;
        const data = await db.all(getData);
        return res.send(data)
    }
    const getData = `SELECT * FROM doctors`;
    const data = await db.all(getData);
    res.send(data);
})

app.get('/doctors/:doctorId/', async(req, res) => {
    const {doctorId} = req.params;
    const getData = `
                SELECT * FROM doctors
                WHERE id = ${doctorId}
    `;
    const data = await db.get(getData);
    res.send(data)
})

app.post('/doctors/booking/form/', async(req, res) => {
    const {doctorId, patientName, email, dateTime} = req.body;

        if(doctorId !== undefined){
            if(patientName !== undefined && patientName.length >= 3){
                if(email !== undefined){
                    if(dateTime !== undefined){
                        const postQuery = `
                            INSERT INTO appointments(doctor_id, patient_name, email, appointment_datetime)
                            VALUES (${doctorId}, '${patientName}', '${email}', '${dateTime}')
                            `
                            await db.run(postQuery);
                            res.send('Appointment Successfully Booked');
                    }else{
                        res.status(400).json({error: "Invalid Appointment Date and Time"});
                    }
                }else{
                    res.status(400).json({error: "Invalid Email Address"});
                    
                }
            }else{
                res.status(400).json({error: "Invalid patient name enter alteast 3 characters"})    
            }
        }else{
            res.status(400).json({error: "Invalid Doctor Id"});
        }
    }
)