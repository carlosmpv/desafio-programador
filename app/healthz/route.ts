import { NextRequest } from "next/server";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let db: Database | null = null;

export async function GET(_req: NextRequest) {
  if (!db) {
    db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    })
  }

  return new Response("200 OK", {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}