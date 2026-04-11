// Load contract addresses and ABIs dynamically from shared folder
// This allows frontend to work with addresses generated during deployment

export interface ContractAddresses {
  Deployer: string;
  UserAuth: string;
  BookCover: string;
}

// Cache for loaded addresses
let cachedAddresses: ContractAddresses | null = null;

/**
 * Load contract addresses from the shared/addresses.json file
 * Falls back to environment variables if not available
 */
export async function loadContractAddresses(): Promise<ContractAddresses> {
  // Return cached addresses if available
  if (cachedAddresses) {
    return cachedAddresses;
  }

  try {
    // Try to load from shared directory (Docker environment)
    // Mounted at public/shared in Docker, so accessible at /shared
    const response = await fetch("/shared/addresses.json");
    if (response.ok) {
      cachedAddresses = await response.json();
      console.log("Loaded addresses from shared folder:", cachedAddresses);
      return cachedAddresses;
    }
  } catch (error) {
    console.warn("Could not load addresses from shared folder, falling back to env variables", error);
  }

  // Fallback to environment variables
  cachedAddresses = {
    Deployer: process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS || "",
    UserAuth: process.env.NEXT_PUBLIC_USER_AUTH_ADDRESS || "",
    BookCover: process.env.NEXT_PUBLIC_BOOK_COVER_ADDRESS || "",
  };

  console.log("Using environment variable addresses:", cachedAddresses);
  return cachedAddresses;
}

/**
 * Load contract ABIs from shared folder or fallback to local artifacts
 */
export async function loadContractABIs() {
  try {
    // Try to load from shared directory (Docker environment)
    // Check if artifacts folder exists
    const bookCoverResponse = await fetch("/shared/artifacts/contracts/BookCover.sol/BookCover.json");
    if (bookCoverResponse.ok) {
      console.log("Artifacts available from shared folder");
      // Return a reference to shared folder location
      return {
        bookCoverPath: "/shared/artifacts/contracts/BookCover.sol/BookCover.json",
        userAuthPath: "/shared/artifacts/contracts/User.sol/UserAuth.json",
      };
    }
  } catch (error) {
    console.warn("Could not load ABIs from shared folder, using local artifacts", error);
  }

  // Fallback to local artifacts (development)
  return {
    bookCoverPath: "/artifacts/contracts/BookCover.sol/BookCover.json",
    userAuthPath: "/artifacts/contracts/User.sol/UserAuth.json",
  };
}

/**
 * Fetch ABI JSON file and extract the abi property
 */
export async function fetchABI(path: string): Promise<any[]> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ABI from ${path}`);
    }
    const data = await response.json();
    return data.abi || data;
  } catch (error) {
    console.error(`Error loading ABI from ${path}:`, error);
    throw error;
  }
}

