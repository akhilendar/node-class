//Modules
// 1. CommonJS Modules  -- require/ module.exports
// 2. Modern JS / ES6 Modules  ---- import/ export

const express = require('express');
const app = express(); //create an express instance
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
let db = null;

const initializeDBAndServer = async () => {
    try{
        db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })
    app.listen(3000, () => {
        console.log("Server Running at http://localhost:3000/")
    })
}catch(e){
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
}
}
initializeDBAndServer()

app.get("/", async (req, res)=>{
    query = `SELECT * FROM users;`
    const result = await db.all(query)
    res.send(result)
})

app.post("/post", async (req, res)=>{
    const {name, email} = req.body;
    const query = `
    INSERT INTO users (name, email)
    VALUES ('${name}', '${email}');
    `
    const result = await db.run(query)
    res.send({userId: result.lastID})
    
})
