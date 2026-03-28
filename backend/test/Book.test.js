import { expect } from "chai";
import { network } from "hardhat";

describe("Book Publishing System", function () {
  let userAuth, bookCover;
  let owner, author, reader;
  let ethers;

  beforeEach(async function () {
    const connection = await network.connect();
    ethers = connection.ethers;

    [owner, author, reader] = await ethers.getSigners();

    const UserAuth = await ethers.getContractFactory("UserAuth");
    userAuth = await UserAuth.deploy();

    const BookCover = await ethers.getContractFactory("BookCover");
    bookCover = await BookCover.deploy(userAuth.target);
  });

  // =========================
  // USER TESTS
  // =========================

  it("Should register users correctly", async function () {
    await userAuth.connect(author).setUserInfo("author", 1, "url");

    const user = await userAuth.connect(author).getUserInfo();
    expect(user.userName).to.equal("author");
    expect(user.userType).to.equal(1);
  });

  // =========================
  // BOOK CREATION TESTS
  // =========================

  it("Should allow author to create book", async function () {
    await userAuth.connect(author).setUserInfo("author", 1, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    const book = await bookCover.books(1);
    expect(book.author).to.equal(author.address);
  });

  it("Should NOT allow reader to create book", async function () {
    await userAuth.connect(reader).setUserInfo("reader", 0, "url");

    await expect(
      bookCover.connect(reader).createBook("ipfs://book", ethers.parseEther("1"))
    ).to.be.revertedWith("Only authors");
  });

  it("Should NOT allow book with zero price", async function () {
    await userAuth.connect(author).setUserInfo("author", 1, "url");

    await expect(
      bookCover.connect(author).createBook("ipfs://book", 0)
    ).to.be.revertedWith("Price must be > 0");
  });

  // =========================
  // BUY TESTS
  // =========================

  it("Should allow reader to buy book and mint NFT", async function () {
    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(reader).setUserInfo("reader", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    await bookCover.connect(reader).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    const ownerOfNFT = await bookCover.ownerOf(1);
    expect(ownerOfNFT).to.equal(reader.address);
  });

  it("Should NOT allow buying non-existent book", async function () {
    await expect(
      bookCover.connect(reader).buyBook(999, {
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("Invalid book");
  });

  it("Should NOT allow purchase with insufficient ETH", async function () {
    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(reader).setUserInfo("reader", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    await expect(
      bookCover.connect(reader).buyBook(1, {
        value: ethers.parseEther("0.5"),
      })
    ).to.be.revertedWith("Insufficient payment");
  });

  // =========================
  // PAYMENT TESTS
  // =========================

  it("Should split payment EXACTLY 90/10", async function () {
    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(reader).setUserInfo("reader", 0, "url");

    const price = ethers.parseEther("1");

    await bookCover.connect(author).createBook("ipfs://book", price);

    const initialAuthor = await ethers.provider.getBalance(author.address);
    const initialPlatform = await ethers.provider.getBalance(owner.address);

    const tx = await bookCover.connect(reader).buyBook(1, { value: price });
    await tx.wait();

    const finalAuthor = await ethers.provider.getBalance(author.address);
    const finalPlatform = await ethers.provider.getBalance(owner.address);

    const authorGain = finalAuthor - initialAuthor;
    const platformGain = finalPlatform - initialPlatform;

    expect(authorGain).to.equal(ethers.parseEther("0.9"));
    expect(platformGain).to.equal(ethers.parseEther("0.1"));
  });

  // =========================
  // MULTIPLE PURCHASE TEST
  // =========================

  it("Should allow multiple users to buy same book", async function () {
    const [, author, reader1, reader2] = await ethers.getSigners();

    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(reader1).setUserInfo("reader1", 0, "url");
    await userAuth.connect(reader2).setUserInfo("reader2", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    await bookCover.connect(reader1).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    await bookCover.connect(reader2).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    expect(await bookCover.ownerOf(1)).to.equal(reader1.address);
    expect(await bookCover.ownerOf(2)).to.equal(reader2.address);
  });

  it("Should allow access via NFT ownership", async function () {
    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(reader).setUserInfo("reader", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    await bookCover.connect(reader).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    const uri = await bookCover.connect(reader).getBookURI(1);
    expect(uri).to.equal("ipfs://book");
  });

  it("Should deny access if user does not own NFT", async function () {
    const [, author, buyer, attacker] = await ethers.getSigners();

    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(buyer).setUserInfo("buyer", 0, "url");
    await userAuth.connect(attacker).setUserInfo("attacker", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    // buyer gets NFT
    await bookCover.connect(buyer).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    // attacker tries to access
    await expect(
      bookCover.connect(attacker).getBookURI(1)
    ).to.be.revertedWith("Access denied");
  });

  it("Should transfer NFT on resale", async function () {
    const [, author, seller, buyer] = await ethers.getSigners();

    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(seller).setUserInfo("seller", 0, "url");
    await userAuth.connect(buyer).setUserInfo("buyer", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    await bookCover.connect(seller).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    await bookCover.connect(buyer).resell(1, {
      value: ethers.parseEther("1"),
    });

    expect(await bookCover.ownerOf(1)).to.equal(buyer.address);
  });

  it("Seller should lose access after resale", async function () {
    const [, author, seller, buyer] = await ethers.getSigners();

    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(seller).setUserInfo("seller", 0, "url");
    await userAuth.connect(buyer).setUserInfo("buyer", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    await bookCover.connect(seller).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    await bookCover.connect(buyer).resell(1, {
      value: ethers.parseEther("1"),
    });

    await expect(
      bookCover.connect(seller).getBookURI(1)
    ).to.be.revertedWith("Access denied");
  });

  it("Buyer should gain access after resale", async function () {
    const [, author, seller, buyer] = await ethers.getSigners();

    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(seller).setUserInfo("seller", 0, "url");
    await userAuth.connect(buyer).setUserInfo("buyer", 0, "url");

    await bookCover.connect(author).createBook("ipfs://book", ethers.parseEther("1"));

    await bookCover.connect(seller).buyBook(1, {
      value: ethers.parseEther("1"),
    });

    await bookCover.connect(buyer).resell(1, {
      value: ethers.parseEther("1"),
    });

    const uri = await bookCover.connect(buyer).getBookURI(1);
    expect(uri).to.equal("ipfs://book");
  });

  it("Should split resale payment correctly (5/10/85)", async function () {
    const [, author, seller, buyer] = await ethers.getSigners();

    await userAuth.connect(author).setUserInfo("author", 1, "url");
    await userAuth.connect(seller).setUserInfo("seller", 0, "url");
    await userAuth.connect(buyer).setUserInfo("buyer", 0, "url");

    const price = ethers.parseEther("1");

    await bookCover.connect(author).createBook("ipfs://book", price);

    await bookCover.connect(seller).buyBook(1, { value: price });

    const initialAuthor = await ethers.provider.getBalance(author.address);
    const initialSeller = await ethers.provider.getBalance(seller.address);
    const initialPlatform = await ethers.provider.getBalance(owner.address);

    const tx = await bookCover.connect(buyer).resell(1, { value: price });
    await tx.wait();

    const finalAuthor = await ethers.provider.getBalance(author.address);
    const finalSeller = await ethers.provider.getBalance(seller.address);
    const finalPlatform = await ethers.provider.getBalance(owner.address);

    expect(finalAuthor - initialAuthor).to.equal(ethers.parseEther("0.1"));
    expect(finalPlatform - initialPlatform).to.equal(ethers.parseEther("0.05"));
    expect(finalSeller - initialSeller).to.equal(ethers.parseEther("0.85"));
  });
});