export async function uploadToIPFS(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const ipfs_url = process.env.IPFS_GATEWAY_URL

  const res = await fetch(`${ipfs_url}/api/v0/add`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  return `ipfs://${data.Hash}`;
}