import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  return new Response("200 OK", {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}