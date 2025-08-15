const express = require('express');
const app = express();
const PORT = 1994;
const {v4: uuid} = require('uuid');
const mysql = require('mysql2');

app.use(express.json());

const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'studentrecords'
});

database.connect((error)=> {
    if (error) {
        console.log(`Error connecting to database: error`, error.message)
    } else {
        console.log("Database connected successfully");
    }
});



// To create a database on mySql workbench
// database.query('CREATE DATABASE studentRecords', (err,)=> {
//     if (err){
//         console.log("Error creating database:", err.message);
//     } else {
//         console.log('Database created successfully or Exists');        
//     }
// });

// To create student's table
database.query('CREATE TABLE students(studentID VARCHAR(100) PRIMARY KEY NOT NULL, fullname VARCHAR(100) NOT NULL, stack ENUM("Frontend", "Backend", "Fullstack") NOT NULL, email VARCHAR(100) NOT NULL)', (err)=> {
    if(err) {
        console.log('Error creating table:', err.message);
    } else {
        console.log('Table created successfully or Exists');     
    }
});

// To create student's score
database.query(`CREATE TABLE scores(scoreID VARCHAR(100) PRIMARY KEY NOT NULL, studentID VARCHAR(100), punctualityScore INT NOT NULL, assignmentScore INT NOT NULL, totalScore INT NOT NULL, FOREIGN KEY(studentID) REFERENCES students(studentID))`, (err) => {
    if(err) {
        console.log('Error creating table:', err.message);
    } else {
        console.log('Table created successfully or Exists');     
    }

})

//  To create a student's score
app.post('/scores', (req, res)=> {
    const {punctualityScore, assignmentScore}= req.body;
    let totalScore = punctualityScore + assignmentScore;
    database.query(`INSERT INTO scores(scoreID, punctualityScore, assignmentScore, totalScore) VALUES(?, ?, ?, ?)`, [uuid(), punctualityScore, assignmentScore, totalScore], (err, result)=> {
        if (err){
            res.status(500).json({
                message: 'Error inserting score', error: err.message
            })
        } else {
            console.log(result);
            res.status(201).json({
                message: 'Score inserted successfully',
                data: result.affectedRows
            })
        }
    })
})
// To create a student
app.post('/students', (req, res)=> {
    const {fullname, stack, email} = req.body;
    database.query('INSERT INTO students(studentID, fullname, stack, email) VALUES(?, ?, ?, ?)', [uuid(), fullname, stack, email], (err, result) => {
        if (err){
            res.status(500).json({
                message: 'Error inserting students', error: err.message
            })
        } else {
            res.status(201).json({
                message: 'Student inserted successfully',
                data: result.affectedRows
            })
        }
    })
})

// To Create stuent's scores : update Student to their scores
app.post('/studentscores', (req, res)=>{
const {studentID, scoreID} = req.body
database.query(`UPDATE scores SET studentID = ? WHERE scoreID = ?`, [studentID, scoreID], (err, rows)=> {
     if (err){
            res.status(500).json({message: `Error creating student's score`, error: err.message})
        } else {
            res.status(201).json({message: `Student's score created successfully`, 
            data: rows});   
        }
    })
})  

//  To read all students and their scores
app.get('/studentscores', (req, res)=> {
database.query(`SELECT * FROM scores`, (err, rows)=>{
     if (err) {
            res.status(500).json({message: 'Error fetching scores', error: err.message})
        } else{
            console.log(rows)
            res.status(200).json({
                message: "All student's scores",
                data: rows
            })
        }
    })
})
// To update a Student's stack
app.put('/update-student/:id', (req, res)=> {
    const id = req.params.id;
    const {fullname, stack, email} = req.body
    database.query(`UPDATE students SET fullname = ?, stack = ?, email = ? WHERE studentID = ?`, [fullname, stack, email, id], (err, row)=>{
         if (err){
            res.status(500).json({
                message: 'Error updating student',
                error: err.message
            })
        } else if (row.length === 0) {
            res.status(404).json({message: `student with ID: ${id} not found`})
        } else {
            res.status(200).json({
                message: 'Student updated successfully',
                data: row.info
            })
        }
    })
 })

//  To delete a Student's score
app.delete('/delete/:id', (req, res)=>{
    const id = req.params.id;
    database.query(`DELETE FROM scores WHERE scoreID = ?`, [id], (err, result)=>{
         if(err) {
            res.status(500).json({
                message: `Error deleting student's score`,
                error: err.message
            })
        } else if (result.affectedRows === 0) {
            res.status(404).json({message: `Score with ID: ${id} not found`})
        } else {
            res.status(200).json({
                message: `Student's score deleted successfully`
            })
        }
    })
 })

//  To get all students & their scores(showing NULL value where no score exists)
app.get('/join-query1', (req, res)=> {
database.query(`SELECT * FROM students LEFT JOIN scores ON students.studentID = scores.studentID`, (err, rows)=>{
    if(err) {
        res.status(500).json({
            message: `Error getting all students and their scores`, 
            error: err.message
        })
    } else {
        res.status(201).json({
            message: `Successfully got all students and their scores`,
            total: rows.length,
            data: rows
        })
    }   
    })
})

// To get all scores and their student(showing NULL value where no student exist)
app.get('/join-query2', (req, res)=> {
database.query(`SELECT * FROM scores LEFT JOIN students ON scores.studentID = students.studentID`, (err, rows)=>{
    if(err) {
        res.status(500).json({
            message: `Error getting all scores and their students`, 
            error: err.message
        })
    } else {
        res.status(201).json({
            message: `Successfully got all scores and their students`,
            total: rows.length,
            data: rows
        })
    }   
    })
})

app.listen(PORT, ()=> {
    console.log('Server is listening to PORT:', PORT);
})