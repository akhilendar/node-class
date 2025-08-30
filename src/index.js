//Modules
// 1. CommonJS Modules  -- require/ module.exports
// 2. Modern JS / ES6 Modules  ---- import/ export

import express from 'express';
const app = express(); //create an express instance
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, './model/database.db');
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
let db = null;

app.use(express.json()); //middleware to parse JSON bodies

const initializeDBAndServer = async () => {
    try{
        db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })
    await db.run(`ALTER TABLE users ADD COLUMN password TEXT;`);
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
   const query = `SELECT * FROM users;`
    const result = await db.all(query)
    res.status(200).send(result)
})

app.post("/post", async (req, res)=>{
    const {username, email} = req.body;
    const query = `
    INSERT INTO users (username, email)
    VALUES ('${username}', '${email}');
    `
    const result = await db.run(query)
    res.status(200).send({userId: result.lastID})
    
})

app.get("/users/:id", async (req, res)=>{
    const {id} = req.params;
    query = `SELECT * FROM users WHERE id=${id};`
    const result = await db.get(query)
    if(result===undefined){
        res.status(404).send("User Not Found")
    }
    res.status(200).send(result)
})

//PUT - Update

app.put("/users/:id", async (req, res)=>{
    const {id} = req.params;
    const {username, email} = req.body;
    const query = `
    UPDATE users
    SET username='${username}',
    email='${email}'
    WHERE id=${id};
    `
    const result = await db.run(query)
    res.status(200).send("User Updated Successfully")
})

//DELETE - Delete a user

app.delete("/users/:id", async (req, res)=>{
     const {id} = req.params;
    const query = `
    DELETE FROM users
    WHERE id=${id};
    `
    const result = await db.run(query)
    res.status(200).send("User Deleted Successfully")
})


app.post("/signup", async (req, res)=>{
    const {username, password} = req.body;
    const userDetails = `SELECT * FROM users WHERE username='${username}';`
    const dbUser = await db.get(userDetails);
    if(dbUser===undefined){
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const createUserQuery = 
        `
            INSERT INTO users (username, password)
            VALUES ('${username}', '${hashedPassword}');
        `
        await db.run(createUserQuery);
        res.status(200).send("User created successfully")
    }else{
        res.status(400).send("User already exists")
    }

})


export default app;