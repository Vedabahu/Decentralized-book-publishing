import { NextResponse } from "next/server";
import { create } from "kubo-rpc-client";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const document = formData.get("document") as File;
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;

    if (!image || !document || !title || !author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const ipfs = create({
      url: process.env.NEXT_PUBLIC_IPFS_API_URL || "http://localhost:5001",
    });

    const imageRes = await ipfs.add(new Uint8Array(await image.arrayBuffer()));
    const docRes = await ipfs.add(new Uint8Array(await document.arrayBuffer()));

    const metadata = {
      name: title,
      author: author,
      image: `ipfs://${imageRes.path}`,
      document: `ipfs://${docRes.path}`,
    };

    const metadataRes = await ipfs.add(JSON.stringify(metadata));

    return NextResponse.json({ metadataCID: metadataRes.path });
  } catch (error: any) {
    console.error("IPFS Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
