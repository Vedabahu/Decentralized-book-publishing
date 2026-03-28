// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

interface IUserAuth {
    function users(
        address
    ) external view returns (string memory, bool, uint8, string memory);
}

contract BookCover is ERC721URIStorage {
    uint256 private _tokenIds;
    uint256 private _bookIds;

    IUserAuth public userContract;
    address public platformOwner;

    uint public platformFeePercent = 10; // primary sale

    struct Book {
        uint256 id;
        address author;
        string metadataURI;
        uint256 price;
    }

    mapping(uint256 => Book) public books;

    // 🔗 token → book mapping
    mapping(uint256 => uint256) public tokenToBook;

    event BookCreated(uint256 bookId, address author);
    event BookPurchased(uint256 bookId, address buyer, uint256 tokenId);
    event BookResold(uint256 tokenId, address from, address to);

    modifier onlyAuthor() {
        (, bool onboarded, uint8 userType, ) = userContract.users(msg.sender);
        require(onboarded, "Not registered");
        require(userType == 1, "Only authors");
        _;
    }

    constructor(address _userContract) ERC721("BookNFT", "BOOK") {
        userContract = IUserAuth(_userContract);
        platformOwner = msg.sender;
    }

    // =========================
    // CREATE BOOK
    // =========================
    function createBook(
        string memory metadataURI,
        uint256 price
    ) public onlyAuthor returns (uint256) {
        require(price > 0, "Price must be > 0");

        _bookIds++;
        uint256 bookId = _bookIds;

        books[bookId] = Book(bookId, msg.sender, metadataURI, price);

        emit BookCreated(bookId, msg.sender);
        return bookId;
    }

    // =========================
    // PRIMARY SALE
    // =========================
    function buyBook(uint256 bookId) public payable returns (uint256) {
        Book memory book = books[bookId];
        require(book.id != 0, "Invalid book");
        require(msg.value >= book.price, "Insufficient payment");

        _tokenIds++;
        uint256 tokenId = _tokenIds;

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, book.metadataURI);

        tokenToBook[tokenId] = bookId;

        // 🔸 Payment split (10% platform, 90% author)
        uint platformCut = (msg.value * platformFeePercent) / 100;
        uint authorCut = msg.value - platformCut;

        (bool s1, ) = payable(platformOwner).call{value: platformCut}("");
        require(s1, "Platform payment failed");

        (bool s2, ) = payable(book.author).call{value: authorCut}("");
        require(s2, "Author payment failed");

        emit BookPurchased(bookId, msg.sender, tokenId);

        return tokenId;
    }

    // =========================
    // RESALE
    // =========================
    function resell(uint256 tokenId) public payable {
        address seller = ownerOf(tokenId);
        require(msg.sender != seller, "Seller cannot buy own NFT");

        uint256 bookId = tokenToBook[tokenId];
        Book memory book = books[bookId];

        uint256 price = book.price; // fixed resale price (simple model)
        require(msg.value >= price, "Insufficient payment");

        // 🔸 Split:
        // 5% platform, 10% author, 85% seller
        uint256 platformCut = (msg.value * 5) / 100;
        uint256 authorCut = (msg.value * 10) / 100;
        uint256 sellerCut = msg.value - platformCut - authorCut;

        (bool s1, ) = payable(platformOwner).call{value: platformCut}("");
        require(s1, "Platform payment failed");

        (bool s2, ) = payable(book.author).call{value: authorCut}("");
        require(s2, "Author payment failed");

        (bool s3, ) = payable(seller).call{value: sellerCut}("");
        require(s3, "Seller payment failed");

        // 🔁 Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        emit BookResold(tokenId, seller, msg.sender);
    }

    // =========================
    // ACCESS CONTROL
    // =========================
    function getBookURI(uint256 tokenId) public view returns (string memory) {
        require(ownerOf(tokenId) == msg.sender, "Access denied");

        uint256 bookId = tokenToBook[tokenId];
        return books[bookId].metadataURI;
    }
}
