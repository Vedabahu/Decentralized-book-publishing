function ensureWebCrypto() {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Web Crypto API is only available in the browser.");
  }
}

function toArrayBuffer(data) {
  if (data instanceof ArrayBuffer) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }

  throw new Error("Unsupported data type. Expected ArrayBuffer or TypedArray.");
}

export async function generateKey() {
  ensureWebCrypto();

  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptFile(file, key) {
  ensureWebCrypto();

  if (!file) {
    throw new Error("File is required for encryption.");
  }

  const fileBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    fileBuffer,
  );

  return { encryptedData, iv };
}

export async function decryptFile(encryptedData, key, iv) {
  ensureWebCrypto();

  const encryptedBuffer = toArrayBuffer(encryptedData);
  const ivBuffer = new Uint8Array(toArrayBuffer(iv));

  return window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    encryptedBuffer,
  );
}
