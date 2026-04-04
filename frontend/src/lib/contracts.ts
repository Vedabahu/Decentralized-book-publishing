export const USER_AUTH_ADDRESS = process.env
  .NEXT_PUBLIC_USER_AUTH_ADDRESS as `0x${string}`;
export const BOOK_COVER_ADDRESS = process.env
  .NEXT_PUBLIC_BOOK_COVER_ADDRESS as `0x${string}`;

export const UserAuthABI = [
  "function getUserInfo() public view returns (tuple(string userName, bool onboarded, uint8 userType, string profileUrl))",
  "function isUser(address _addr) public view returns (bool)",
  "function setUserInfo(string calldata _username, uint8 _usertype, string calldata _profileUrl) public returns (bool)",
];

export const BookCoverABI = [
  "function createBook(string memory metadataURI, uint256 price) public returns (uint256)",
  "function buyBook(uint256 bookId) public payable returns (uint256)",
  "function resell(uint256 tokenId) public payable",
  "function getBookURI(uint256 tokenId) public view returns (string memory)",
];
