const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleAuction", function () {
  let auction;
  let owner;
  let seller;
  let bidder1;
  let bidder2;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    const SimpleAuction = await ethers.getContractFactory("SimpleAuction");
    auction = await SimpleAuction.deploy();
    await auction.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await auction.owner()).to.equal(owner.address);
    });

    it("Should start with 0 auctions", async function () {
      expect(await auction.auctionCount()).to.equal(0);
    });
  });

  describe("Creating Auctions", function () {
    it("Should create a new auction", async function () {
      const tx = await auction.connect(seller).createAuction(
        "Test Product",
        ethers.parseEther("1"),
        3600 // 1 hour
      );
      await tx.wait();

      expect(await auction.auctionCount()).to.equal(1);
      
      const auctionData = await auction.getAuction(1);
      expect(auctionData.productName).to.equal("Test Product");
      expect(auctionData.seller).to.equal(seller.address);
    });

    it("Should revert if base price is 0", async function () {
      await expect(
        auction.connect(seller).createAuction("Test", 0, 3600)
      ).to.be.revertedWith("Base price must be greater than 0");
    });
  });

  describe("Bidding", function () {
    beforeEach(async function () {
      await auction.connect(seller).createAuction(
        "Test Product",
        ethers.parseEther("1"),
        3600
      );
    });

    it("Should allow placing a bid", async function () {
      await auction.connect(bidder1).placeBid(1, {
        value: ethers.parseEther("2")
      });

      const auctionData = await auction.getAuction(1);
      expect(auctionData.highestBid).to.equal(ethers.parseEther("2"));
      expect(auctionData.highestBidder).to.equal(bidder1.address);
    });

    it("Should reject bid lower than highest bid", async function () {
      await auction.connect(bidder1).placeBid(1, {
        value: ethers.parseEther("2")
      });

      await expect(
        auction.connect(bidder2).placeBid(1, {
          value: ethers.parseEther("1.5")
        })
      ).to.be.revertedWith("Bid must be higher than current highest bid");
    });

    it("Should refund previous highest bidder", async function () {
      const bidder1BalanceBefore = await ethers.provider.getBalance(bidder1.address);
      
      await auction.connect(bidder1).placeBid(1, {
        value: ethers.parseEther("2")
      });

      const bidder2BalanceBefore = await ethers.provider.getBalance(bidder2.address);
      
      const tx = await auction.connect(bidder2).placeBid(1, {
        value: ethers.parseEther("3")
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const bidder1BalanceAfter = await ethers.provider.getBalance(bidder1.address);
      
      // Bidder1 should have received their refund minus gas
      expect(bidder1BalanceAfter).to.be.closeTo(
        bidder1BalanceBefore + ethers.parseEther("2") - gasUsed,
        ethers.parseEther("0.1")
      );
    });
  });

  describe("Ending Auctions", function () {
    beforeEach(async function () {
      await auction.connect(seller).createAuction(
        "Test Product",
        ethers.parseEther("1"),
        3600
      );
    });

    it("Should allow seller to end auction early", async function () {
      await auction.connect(bidder1).placeBid(1, {
        value: ethers.parseEther("2")
      });

      await auction.connect(seller).endAuction(1);
      
      const auctionData = await auction.getAuction(1);
      expect(auctionData.isActive).to.be.false;
    });

    it("Should transfer funds to seller when auction ends", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      
      await auction.connect(bidder1).placeBid(1, {
        value: ethers.parseEther("2")
      });

      const tx = await auction.connect(seller).endAuction(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      
      expect(sellerBalanceAfter).to.be.closeTo(
        sellerBalanceBefore + ethers.parseEther("2") - gasUsed,
        ethers.parseEther("0.1")
      );
    });
  });
});

