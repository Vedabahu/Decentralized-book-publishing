import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  const body = await req.json();

  const db = await getDB();

  await db.collection("books").insertOne({
    bookId: body.bookId,
    author: body.author,
    metadataURI: body.metadataURI,
    price: body.price,
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const db = await getDB();

  const books = await db.collection("books").find().toArray();

  return NextResponse.json(books);
}