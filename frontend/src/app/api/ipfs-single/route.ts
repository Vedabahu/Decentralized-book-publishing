import { NextResponse } from "next/server";
import { create } from "kubo-rpc-client";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const ipfs = create({
      url: process.env.NEXT_PUBLIC_IPFS_API_URL || "http://localhost:5001",
    });

    const res = await ipfs.add(new Uint8Array(await file.arrayBuffer()));

    return NextResponse.json({ cid: res.path });
  } catch (error: any) {
    console.error("IPFS Single Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
