// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleAuction
 * @dev A minimal auction contract for E-Auction platform
 * @notice This contract handles basic auction functionality
 */
contract SimpleAuction {
    struct Auction {
        uint256 id;
        address seller;
        string productName;
        uint256 basePrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isActive;
        bool exists;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => address[]) public bidders;
    mapping(uint256 => mapping(address => uint256)) public bids;
    
    uint256 public auctionCount;
    address public owner;

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        string productName,
        uint256 basePrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalPrice
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier validAuction(uint256 _auctionId) {
        require(auctions[_auctionId].exists, "Auction does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        auctionCount = 0;
    }

    /**
     * @dev Create a new auction
     * @param _productName Name of the product
     * @param _basePrice Starting price of the auction
     * @param _duration Duration of auction in seconds
     */
    function createAuction(
        string memory _productName,
        uint256 _basePrice,
        uint256 _duration
    ) external returns (uint256) {
        require(_basePrice > 0, "Base price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        auctionCount++;
        uint256 auctionId = auctionCount;

        auctions[auctionId] = Auction({
            id: auctionId,
            seller: msg.sender,
            productName: _productName,
            basePrice: _basePrice,
            highestBid: _basePrice,
            highestBidder: address(0),
            endTime: block.timestamp + _duration,
            isActive: true,
            exists: true
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _productName,
            _basePrice,
            auctions[auctionId].endTime
        );

        return auctionId;
    }

    /**
     * @dev Place a bid on an auction
     * @param _auctionId ID of the auction
     */
    function placeBid(uint256 _auctionId) external payable validAuction(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.isActive, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");
        require(msg.sender != auction.seller, "Seller cannot bid on their own auction");

        // Refund previous highest bidder if exists
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        // Update auction
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        // Track bid
        bids[_auctionId][msg.sender] = msg.value;
        
        // Add to bidders list if first time
        if (bids[_auctionId][msg.sender] == msg.value) {
            bidders[_auctionId].push(msg.sender);
        }

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    /**
     * @dev End an auction and transfer funds
     * @param _auctionId ID of the auction
     */
    function endAuction(uint256 _auctionId) external validAuction(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        
        require(auction.isActive, "Auction is not active");
        require(
            block.timestamp >= auction.endTime || msg.sender == auction.seller,
            "Auction has not ended"
        );

        auction.isActive = false;

        if (auction.highestBidder != address(0)) {
            // Transfer funds to seller
            payable(auction.seller).transfer(auction.highestBid);
            
            emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);
        } else {
            emit AuctionEnded(_auctionId, address(0), 0);
        }
    }

    /**
     * @dev Get auction details
     * @param _auctionId ID of the auction
     */
    function getAuction(uint256 _auctionId)
        external
        view
        validAuction(_auctionId)
        returns (
            uint256 id,
            address seller,
            string memory productName,
            uint256 basePrice,
            uint256 highestBid,
            address highestBidder,
            uint256 endTime,
            bool isActive
        )
    {
        Auction storage auction = auctions[_auctionId];
        return (
            auction.id,
            auction.seller,
            auction.productName,
            auction.basePrice,
            auction.highestBid,
            auction.highestBidder,
            auction.endTime,
            auction.isActive
        );
    }

    /**
     * @dev Get bidder count for an auction
     * @param _auctionId ID of the auction
     */
    function getBidderCount(uint256 _auctionId) external view validAuction(_auctionId) returns (uint256) {
        return bidders[_auctionId].length;
    }

    /**
     * @dev Get bid amount for a specific bidder
     * @param _auctionId ID of the auction
     * @param _bidder Address of the bidder
     */
    function getBid(uint256 _auctionId, address _bidder) external view validAuction(_auctionId) returns (uint256) {
        return bids[_auctionId][_bidder];
    }
}

