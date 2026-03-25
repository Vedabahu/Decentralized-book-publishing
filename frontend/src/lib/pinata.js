export async function uploadFile(file) {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  console.log("Starting mock upload to IPFS:", file.name);

  const delayMs = 1000 + Math.floor(Math.random() * 1000);
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

  const fakeHash = `fakeHash${Date.now()}`;
  const ipfsUri = `ipfs://${fakeHash}`;

  console.log("Mock upload completed:", ipfsUri);

  return ipfsUri;
}
