import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPromise = open({
    filename: path.resolve("./users.db"),
    driver: sqlite3.Database,
});

const initializeDb = async () => {
    const db = await dbPromise;
    await db.exec(`
         CREATE TABLE IF NOT EXISTS users (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           userId TEXT UNIQUE,
           password TEXT NOT NULL,
           learning_profile TEXT DEFAULT 'This user has no learning profile yet.'
      )
`);

    console.log("Users table initialized");
};

initializeDb();

export default dbPromise;