"use client";

import { createContext, useContext, useState } from "react";

const OwnershipContext = createContext(undefined);

export function OwnershipProvider({ children }) {
  const [ownedBookIds, setOwnedBookIds] = useState([]);

  const addOwnedBook = (bookId) => {
    const normalizedId = String(bookId);

    setOwnedBookIds((prevIds) =>
      prevIds.includes(normalizedId) ? prevIds : [...prevIds, normalizedId],
    );
  };

  const isBookOwned = (bookId) => ownedBookIds.includes(String(bookId));

  const value = {
    ownedBookIds,
    addOwnedBook,
    isBookOwned,
  };

  return <OwnershipContext.Provider value={value}>{children}</OwnershipContext.Provider>;
}

export function useOwnership() {
  const context = useContext(OwnershipContext);

  if (!context) {
    throw new Error("useOwnership must be used inside an OwnershipProvider");
  }

  return context;
}
