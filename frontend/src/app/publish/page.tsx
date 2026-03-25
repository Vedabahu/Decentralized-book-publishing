"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../contexts/AppContext";
import { useToast } from "../../contexts/ToastContext";
import { encryptFile, generateKey } from "../../lib/encryption";
import { uploadFile } from "../../lib/pinata";

const defaultBookImages = ["/bitcoin.jpg", "/satoshi.jpg", "/block-chain.jpg"];

export default function PublishPage() {
  const router = useRouter();
  const { addBook } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maxCopies, setMaxCopies] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [authors, setAuthors] = useState([{ name: "", wallet: "", royalty: "" }]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authorErrors, setAuthorErrors] = useState([]);
  const [royaltyError, setRoyaltyError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleAuthorChange = (index, field, value) => {
    setAuthors((prevAuthors) =>
      prevAuthors.map((author, authorIndex) =>
        authorIndex === index ? { ...author, [field]: value } : author,
      ),
    );
  };

  const handleAddAuthor = () => {
    setAuthors((prevAuthors) => [...prevAuthors, { name: "", wallet: "", royalty: "" }]);
  };

  const handleRemoveAuthor = (index) => {
    setAuthors((prevAuthors) =>
      prevAuthors.length === 1 ? prevAuthors : prevAuthors.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextFieldErrors = {};
    const nextAuthorErrors = authors.map(() => ({ name: "", wallet: "", royalty: "" }));

    if (!title.trim()) {
      nextFieldErrors.title = "Title is required.";
    }

    if (!description.trim()) {
      nextFieldErrors.description = "Description is required.";
    }

    if (!price.trim()) {
      nextFieldErrors.price = "Price is required.";
    } else if (Number(price) <= 0) {
      nextFieldErrors.price = "Price must be greater than 0.";
    }

    if (!maxCopies.trim()) {
      nextFieldErrors.maxCopies = "Max Copies is required.";
    } else if (Number(maxCopies) <= 0) {
      nextFieldErrors.maxCopies = "Max Copies must be greater than 0.";
    }

    if (!pdfFile) {
      nextFieldErrors.pdfFile = "Please select a PDF file.";
    }

    let royaltyTotal = 0;
    authors.forEach((author, index) => {
      if (!author.name.trim()) {
        nextAuthorErrors[index].name = "Author name is required.";
      }

      if (!author.wallet.trim()) {
        nextAuthorErrors[index].wallet = "Wallet address is required.";
      }

      if (!author.royalty.trim()) {
        nextAuthorErrors[index].royalty = "Royalty percentage is required.";
      }

      royaltyTotal += Number(author.royalty || 0);
    });

    let nextRoyaltyError = "";
    if (royaltyTotal !== 100) {
      nextRoyaltyError = "Royalty percentages must sum to exactly 100.";
    }

    const hasFieldErrors = Object.keys(nextFieldErrors).length > 0;
    const hasAuthorErrors = nextAuthorErrors.some(
      (errorItem) => errorItem.name || errorItem.wallet || errorItem.royalty,
    );
    const hasRoyaltyError = Boolean(nextRoyaltyError);

    setFieldErrors(nextFieldErrors);
    setAuthorErrors(nextAuthorErrors);
    setRoyaltyError(nextRoyaltyError);

    if (hasFieldErrors || hasAuthorErrors || hasRoyaltyError) {
      setSubmitMessage("Please fix the highlighted fields before publishing.");
      showToast({
        message: "Please fix the highlighted fields before publishing.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const encryptionKey = await generateKey();
      const { encryptedData, iv } = await encryptFile(pdfFile, encryptionKey);

      const encryptedFile = new File([encryptedData], `${pdfFile.name}.enc`, {
        type: "application/octet-stream",
      });
      const ipfsHash = await uploadFile(encryptedFile);

      console.log("Encryption key:", encryptionKey);
      console.log("Encrypted file:", { encryptedData, iv });
      console.log("Fake IPFS hash:", ipfsHash);
      console.log("Book publish form data:", {
        title,
        description,
        price,
        maxCopies,
        authors,
        file: pdfFile,
      });

      const newBook = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        totalCopies: Number(maxCopies),
        soldCopies: 0,
        authors: authors.map((author) => ({
          name: author.name.trim(),
          wallet: author.wallet.trim(),
          royalty: Number(author.royalty),
        })),
        image:
          coverImagePreview ||
          defaultBookImages[Math.floor(Math.random() * defaultBookImages.length)],
      };

      addBook(newBook);

      setSubmitMessage("Book data prepared for publishing");
      showToast({ message: "Book data prepared for publishing", type: "success" });
      window.setTimeout(() => {
        router.push("/");
      }, 900);
    } catch (error) {
      console.error("Encryption/upload failed:", error);
      setSubmitMessage("Failed to encrypt or upload file. Please try again.");
      showToast({ message: "Failed to encrypt or upload file. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setPdfFile(selectedFile);
  };

  const handleCoverImageChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setCoverImageFile(selectedFile);

    if (!selectedFile) {
      if (coverImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview);
      }
      setCoverImagePreview("");
      return;
    }

    if (coverImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverImagePreview);
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setCoverImagePreview(previewUrl);
  };

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 sm:py-10">
        <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Publish Book
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-base text-slate-600 sm:text-lg">
          Fill in the details below to create your new book listing.
        </p>

        <form className="mx-auto mt-10 max-w-2xl space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-slate-800">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter book title"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            {fieldErrors.title && <p className="text-sm text-red-600">{fieldErrors.title}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-800">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write a short description of your book"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold text-slate-800">
                Price (ETH)
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.01"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              {fieldErrors.price && <p className="text-sm text-red-600">{fieldErrors.price}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="maxCopies" className="text-sm font-semibold text-slate-800">
                Max Copies
              </label>
              <input
                id="maxCopies"
                type="number"
                value={maxCopies}
                onChange={(event) => setMaxCopies(event.target.value)}
                placeholder="100"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              {fieldErrors.maxCopies && (
                <p className="text-sm text-red-600">{fieldErrors.maxCopies}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="coverImage" className="text-sm font-semibold text-slate-800">
              Cover Image
            </label>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className={`text-sm ${coverImageFile ? "text-slate-700" : "text-slate-500"}`}>
              {coverImageFile
                ? `Selected image: ${coverImageFile.name}`
                : "No cover image selected (default will be used)."}
            </p>
            {coverImagePreview ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="h-52 w-full rounded-xl object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="bookPdf" className="text-sm font-semibold text-slate-800">
              Book PDF
            </label>
            <input
              id="bookPdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handlePdfChange}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />
            <p className={`text-sm ${pdfFile ? "text-slate-700" : "text-slate-500"}`}>
              {pdfFile ? `Selected file: ${pdfFile.name}` : "No file selected."}
            </p>
            {fieldErrors.pdfFile && <p className="text-sm text-red-600">{fieldErrors.pdfFile}</p>}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Authors & Royalties</h2>
              <button
                type="button"
                onClick={handleAddAuthor}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Add Author
              </button>
            </div>

            <div className="space-y-3">
              {authors.map((author, index) => (
                <div
                  key={`author-${index}`}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor={`author-name-${index}`}
                      className="text-sm font-semibold text-slate-800"
                    >
                      Author Name
                    </label>
                    <input
                      id={`author-name-${index}`}
                      type="text"
                      value={author.name}
                      onChange={(event) =>
                        handleAuthorChange(index, "name", event.target.value)
                      }
                      placeholder="Alice"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                    {authorErrors[index]?.name && (
                      <p className="text-sm text-red-600">{authorErrors[index].name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`author-wallet-${index}`}
                      className="text-sm font-semibold text-slate-800"
                    >
                      Wallet Address
                    </label>
                    <input
                      id={`author-wallet-${index}`}
                      type="text"
                      value={author.wallet}
                      onChange={(event) =>
                        handleAuthorChange(index, "wallet", event.target.value)
                      }
                      placeholder="0x..."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                    {authorErrors[index]?.wallet && (
                      <p className="text-sm text-red-600">{authorErrors[index].wallet}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`author-royalty-${index}`}
                      className="text-sm font-semibold text-slate-800"
                    >
                      Royalty %
                    </label>
                    <input
                      id={`author-royalty-${index}`}
                      type="number"
                      value={author.royalty}
                      onChange={(event) =>
                        handleAuthorChange(index, "royalty", event.target.value)
                      }
                      placeholder="50"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                    {authorErrors[index]?.royalty && (
                      <p className="text-sm text-red-600">{authorErrors[index].royalty}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAuthor(index)}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={authors.length === 1}
                  >
                    Remove Author
                  </button>
                </div>
              ))}
            </div>

            {royaltyError && <p className="text-sm font-medium text-red-600">{royaltyError}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
              isSubmitting
                ? "cursor-not-allowed bg-slate-500"
                : "bg-slate-900 hover:-translate-y-0.5 hover:bg-slate-700"
            }`}
          >
            {isSubmitting ? "Publishing..." : "Publish Book"}
          </button>

          {submitMessage && (
            <p
              className={`text-center text-sm font-medium ${
                submitMessage === "Book data prepared for publishing"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {submitMessage}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
