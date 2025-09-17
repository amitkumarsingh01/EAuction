# main.py
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import bcrypt
import enum
import os
from contextlib import contextmanager

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./auction.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Enums
class UserType(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"

class AuctionStatus(str, enum.Enum):
    CREATED = "created"
    ACTIVE = "active"
    ENDED = "ended"
    WINNER_SELECTED = "winner_selected"

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    user_type = Column(SQLEnum(UserType))
    created_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    auctions_created = relationship("Auction", back_populates="seller", foreign_keys="Auction.seller_id")
    bids = relationship("Bid", back_populates="bidder")
    won_auctions = relationship("Auction", back_populates="winner", foreign_keys="Auction.winner_id")

class Auction(Base):
    __tablename__ = "auctions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True)
    description = Column(Text)
    base_price = Column(Float)
    current_highest_bid = Column(Float, default=0)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(SQLEnum(AuctionStatus), default=AuctionStatus.CREATED)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # Foreign keys
    seller_id = Column(Integer, ForeignKey("users.id"))
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    seller = relationship("User", back_populates="auctions_created", foreign_keys=[seller_id])
    winner = relationship("User", back_populates="won_auctions", foreign_keys=[winner_id])
    bids = relationship("Bid", back_populates="auction")

class Bid(Base):
    __tablename__ = "bids"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    bid_time = Column(DateTime, default=func.now())
    
    # Foreign keys
    bidder_id = Column(Integer, ForeignKey("users.id"))
    auction_id = Column(Integer, ForeignKey("auctions.id"))
    
    # Relationships
    bidder = relationship("User", back_populates="bids")
    auction = relationship("Auction", back_populates="bids")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    user_type: UserType

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    user_type: UserType

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: int

class AuctionCreate(BaseModel):
    product_name: str
    description: str
    base_price: float
    start_time: datetime
    end_time: datetime
    seller_id: int

class AuctionResponse(BaseModel):
    id: int
    product_name: str
    description: str
    base_price: float
    current_highest_bid: float
    start_time: datetime
    end_time: datetime
    status: AuctionStatus
    image_url: Optional[str]
    seller_id: int

class BidCreate(BaseModel):
    auction_id: int
    amount: float
    bidder_id: int

class BidResponse(BaseModel):
    id: int
    amount: float
    bid_time: datetime
    bidder_id: int
    auction_id: int

class DashboardStats(BaseModel):
    active_auctions: int
    total_users: int
    total_sales_volume: float
    total_bids: int

# FastAPI app
app = FastAPI(title="Auction System API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security (disabled for all endpoints except login)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Token verification and current user are not required except for login.

def check_auction_status():
    """Background task to update auction status"""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        
        # Start auctions that should be active
        auctions_to_start = db.query(Auction).filter(
            Auction.start_time <= now,
            Auction.status == AuctionStatus.CREATED
        ).all()
        
        for auction in auctions_to_start:
            auction.status = AuctionStatus.ACTIVE
        
        # End auctions that should be ended
        auctions_to_end = db.query(Auction).filter(
            Auction.end_time <= now,
            Auction.status == AuctionStatus.ACTIVE
        ).all()
        
        for auction in auctions_to_end:
            auction.status = AuctionStatus.ENDED
            
            # Find winner (highest bidder)
            highest_bid = db.query(Bid).filter(
                Bid.auction_id == auction.id
            ).order_by(Bid.amount.desc()).first()
            
            if highest_bid:
                auction.winner_id = highest_bid.bidder_id
                auction.status = AuctionStatus.WINNER_SELECTED
                
                # Create notifications
                winner_notification = Notification(
                    user_id=highest_bid.bidder_id,
                    message=f"Congratulations! You won the auction for {auction.product_name} with a bid of ${highest_bid.amount}"
                )
                seller_notification = Notification(
                    user_id=auction.seller_id,
                    message=f"Your auction for {auction.product_name} has ended. Winner: User {highest_bid.bidder_id} with ${highest_bid.amount}"
                )
                db.add(winner_notification)
                db.add(seller_notification)
        
        db.commit()
    finally:
        db.close()

# API Endpoints

@app.get("/")
def root():
    return {"message": "Auction System API", "version": "1.0.0"}

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        user_type=user.user_type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(db_user.id), "user_type": db_user.user_type.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": db_user.user_type.value,
        "user_id": db_user.id
    }

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Verify user type
    if db_user.user_type != user.user_type:
        raise HTTPException(status_code=401, detail="Invalid user type")
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(db_user.id), "user_type": db_user.user_type.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": db_user.user_type.value,
        "user_id": db_user.id
    }

@app.post("/auctions/create", response_model=AuctionResponse)
def create_auction(
    auction: AuctionCreate,
    db: Session = Depends(get_db)
):
    db_auction = Auction(
        product_name=auction.product_name,
        description=auction.description,
        base_price=auction.base_price,
        start_time=auction.start_time,
        end_time=auction.end_time,
        seller_id=auction.seller_id,
        current_highest_bid=auction.base_price
    )
    db.add(db_auction)
    db.commit()
    db.refresh(db_auction)
    
    return AuctionResponse(
        id=db_auction.id,
        product_name=db_auction.product_name,
        description=db_auction.description,
        base_price=db_auction.base_price,
        current_highest_bid=db_auction.current_highest_bid,
        start_time=db_auction.start_time,
        end_time=db_auction.end_time,
        status=db_auction.status,
        image_url=db_auction.image_url,
        seller_id=db_auction.seller_id
    )

@app.get("/auctions", response_model=List[AuctionResponse])
def get_auctions(db: Session = Depends(get_db)):
    check_auction_status()
    auctions = db.query(Auction).all()
    return [
        AuctionResponse(
            id=auction.id,
            product_name=auction.product_name,
            description=auction.description,
            base_price=auction.base_price,
            current_highest_bid=auction.current_highest_bid,
            start_time=auction.start_time,
            end_time=auction.end_time,
            status=auction.status,
            image_url=auction.image_url,
            seller_id=auction.seller_id
        ) for auction in auctions
    ]

@app.get("/auctions/active", response_model=List[AuctionResponse])
def get_active_auctions(db: Session = Depends(get_db)):
    check_auction_status()
    auctions = db.query(Auction).filter(Auction.status == AuctionStatus.ACTIVE).all()
    return [
        AuctionResponse(
            id=auction.id,
            product_name=auction.product_name,
            description=auction.description,
            base_price=auction.base_price,
            current_highest_bid=auction.current_highest_bid,
            start_time=auction.start_time,
            end_time=auction.end_time,
            status=auction.status,
            image_url=auction.image_url,
            seller_id=auction.seller_id
        ) for auction in auctions
    ]

@app.post("/bids/place", response_model=BidResponse)
def place_bid(
    bid: BidCreate,
    db: Session = Depends(get_db)
):
    # Check if auction exists and is active
    auction = db.query(Auction).filter(Auction.id == bid.auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    check_auction_status()
    
    if auction.status != AuctionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Auction is not active")
    
    # Check if bid is higher than current highest bid
    if bid.amount <= auction.current_highest_bid:
        raise HTTPException(
            status_code=400, 
            detail=f"Bid must be higher than current highest bid of ${auction.current_highest_bid}"
        )
    
    # Create bid
    db_bid = Bid(
        amount=bid.amount,
        bidder_id=bid.bidder_id,
        auction_id=bid.auction_id
    )
    db.add(db_bid)
    
    # Update auction's current highest bid
    auction.current_highest_bid = bid.amount
    
    # Create notification for seller
    notification = Notification(
        user_id=auction.seller_id,
        message=f"New bid of ${bid.amount} placed on your auction '{auction.product_name}'"
    )
    db.add(notification)
    
    db.commit()
    db.refresh(db_bid)
    
    return BidResponse(
        id=db_bid.id,
        amount=db_bid.amount,
        bid_time=db_bid.bid_time,
        bidder_id=db_bid.bidder_id,
        auction_id=db_bid.auction_id
    )

@app.get("/dashboard/buyer")
def buyer_dashboard(user_id: int, db: Session = Depends(get_db)):
    check_auction_status()
    
    # Active bids
    active_bids = db.query(Bid).join(Auction).filter(
        Bid.bidder_id == user_id,
        Auction.status == AuctionStatus.ACTIVE
    ).all()
    
    # Won items
    won_auctions = db.query(Auction).filter(Auction.winner_id == user_id).all()
    
    # All bids history
    bid_history = db.query(Bid).filter(Bid.bidder_id == user_id).all()
    
    return {
        "active_bids": len(active_bids),
        "won_items": len(won_auctions),
        "total_bids": len(bid_history),
        "active_bids_details": [
            {
                "bid_id": bid.id,
                "amount": bid.amount,
                "auction_name": bid.auction.product_name,
                "auction_end_time": bid.auction.end_time
            } for bid in active_bids
        ],
        "won_items_details": [
            {
                "auction_id": auction.id,
                "product_name": auction.product_name,
                "winning_bid": auction.current_highest_bid
            } for auction in won_auctions
        ]
    }

@app.get("/dashboard/seller")
def seller_dashboard(user_id: int, db: Session = Depends(get_db)):
    check_auction_status()
    
    # Seller's auctions
    auctions = db.query(Auction).filter(Auction.seller_id == user_id).all()
    active_auctions = [a for a in auctions if a.status == AuctionStatus.ACTIVE]
    completed_auctions = [a for a in auctions if a.status == AuctionStatus.WINNER_SELECTED]
    
    # Calculate earnings
    total_earnings = sum(a.current_highest_bid for a in completed_auctions)
    
    return {
        "total_auctions": len(auctions),
        "active_auctions": len(active_auctions),
        "completed_auctions": len(completed_auctions),
        "total_earnings": total_earnings,
        "active_auctions_details": [
            {
                "auction_id": auction.id,
                "product_name": auction.product_name,
                "current_highest_bid": auction.current_highest_bid,
                "end_time": auction.end_time
            } for auction in active_auctions
        ],
        "completed_auctions_details": [
            {
                "auction_id": auction.id,
                "product_name": auction.product_name,
                "final_price": auction.current_highest_bid,
                "winner_id": auction.winner_id
            } for auction in completed_auctions
        ]
    }

@app.get("/dashboard/admin", response_model=DashboardStats)
def admin_dashboard(db: Session = Depends(get_db)):
    check_auction_status()
    
    # System statistics
    active_auctions = db.query(Auction).filter(Auction.status == AuctionStatus.ACTIVE).count()
    total_users = db.query(User).count()
    total_bids = db.query(Bid).count()
    
    # Calculate total sales volume
    completed_auctions = db.query(Auction).filter(
        Auction.status == AuctionStatus.WINNER_SELECTED
    ).all()
    total_sales_volume = sum(auction.current_highest_bid for auction in completed_auctions)
    
    return DashboardStats(
        active_auctions=active_auctions,
        total_users=total_users,
        total_sales_volume=total_sales_volume,
        total_bids=total_bids
    )

@app.get("/auctions/{auction_id}/bids", response_model=List[BidResponse])
def get_auction_bids(
    auction_id: int,
    db: Session = Depends(get_db)
):
    bids = db.query(Bid).filter(Bid.auction_id == auction_id).order_by(Bid.bid_time.desc()).all()
    return [
        BidResponse(
            id=bid.id,
            amount=bid.amount,
            bid_time=bid.bid_time,
            bidder_id=bid.bidder_id,
            auction_id=bid.auction_id
        ) for bid in bids
    ]

@app.get("/notifications")
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).all()
    
    return [
        {
            "id": notification.id,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at
        } for notification in notifications
    ]

@app.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@app.get("/users/me")
def get_current_user_info(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "user_type": user.user_type.value,
        "created_at": user.created_at,
        "is_active": user.is_active
    }

# Admin endpoints
@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "user_type": user.user_type.value,
            "created_at": user.created_at,
            "is_active": user.is_active
        } for user in users
    ]

@app.get("/admin/auctions")
def get_all_auctions_admin(db: Session = Depends(get_db)):
    check_auction_status()
    auctions = db.query(Auction).all()
    return [
        {
            "id": auction.id,
            "product_name": auction.product_name,
            "base_price": auction.base_price,
            "current_highest_bid": auction.current_highest_bid,
            "status": auction.status.value,
            "seller_id": auction.seller_id,
            "winner_id": auction.winner_id,
            "start_time": auction.start_time,
            "end_time": auction.end_time
        } for auction in auctions
    ]

# Additional endpoints for complete functionality

@app.get("/auctions/past", response_model=List[AuctionResponse])
def get_past_auctions(db: Session = Depends(get_db)):
    """Browse past auctions - available to all users"""
    check_auction_status()
    auctions = db.query(Auction).filter(
        Auction.status.in_([AuctionStatus.ENDED, AuctionStatus.WINNER_SELECTED])
    ).all()
    return [
        AuctionResponse(
            id=auction.id,
            product_name=auction.product_name,
            description=auction.description,
            base_price=auction.base_price,
            current_highest_bid=auction.current_highest_bid,
            start_time=auction.start_time,
            end_time=auction.end_time,
            status=auction.status,
            image_url=auction.image_url,
            seller_id=auction.seller_id
        ) for auction in auctions
    ]

@app.get("/buyer/bidding-history")
def get_buyer_bidding_history(user_id: int, db: Session = Depends(get_db)):
    """View personal bidding history for buyers"""
    bids = db.query(Bid).join(Auction).filter(Bid.bidder_id == user_id).all()
    
    return [
        {
            "bid_id": bid.id,
            "amount": bid.amount,
            "bid_time": bid.bid_time,
            "auction_name": bid.auction.product_name,
            "auction_status": bid.auction.status.value,
            "is_winning": bid.amount == bid.auction.current_highest_bid and bid.auction.status == AuctionStatus.ACTIVE
        } for bid in bids
    ]

@app.get("/seller/live-auctions")
def get_seller_live_auctions(user_id: int, db: Session = Depends(get_db)):
    """Track live auctions for sellers with real-time bid info"""
    check_auction_status()
    
    live_auctions = db.query(Auction).filter(
        Auction.seller_id == user_id,
        Auction.status == AuctionStatus.ACTIVE
    ).all()
    
    result = []
    for auction in live_auctions:
        # Get latest bids
        latest_bids = db.query(Bid).filter(Bid.auction_id == auction.id).order_by(Bid.bid_time.desc()).limit(5).all()
        
        result.append({
            "auction_id": auction.id,
            "product_name": auction.product_name,
            "current_highest_bid": auction.current_highest_bid,
            "base_price": auction.base_price,
            "end_time": auction.end_time,
            "total_bids": len(auction.bids),
            "recent_bids": [
                {
                    "amount": bid.amount,
                    "bid_time": bid.bid_time,
                    "bidder_id": bid.bidder_id
                } for bid in latest_bids
            ]
        })
    
    return result

@app.get("/seller/completed-auctions")
def get_seller_completed_auctions(user_id: int, db: Session = Depends(get_db)):
    """View completed auctions with winners and earnings"""
    completed_auctions = db.query(Auction).filter(
        Auction.seller_id == user_id,
        Auction.status == AuctionStatus.WINNER_SELECTED
    ).all()
    
    return [
        {
            "auction_id": auction.id,
            "product_name": auction.product_name,
            "final_price": auction.current_highest_bid,
            "base_price": auction.base_price,
            "winner_id": auction.winner_id,
            "end_time": auction.end_time,
            "total_bids": len(auction.bids),
            "profit": auction.current_highest_bid - auction.base_price
        } for auction in completed_auctions
    ]

@app.post("/auctions/{auction_id}/upload-image")
async def upload_auction_image(
    auction_id: int,
    seller_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload product images for auctions"""
    if current_user.user_type != UserType.SELLER:
        raise HTTPException(status_code=403, detail="Only sellers can upload images")
    
    # Check if auction belongs to current seller
    auction = db.query(Auction).filter(
        Auction.id == auction_id,
        Auction.seller_id == seller_id
    ).first()
    
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found or access denied")
    
    # Simple image storage (in production, use cloud storage like AWS S3)
    import uuid
    file_extension = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{filename}"
    
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Update auction with image URL
    auction.image_url = file_path
    db.commit()
    
    return {"message": "Image uploaded successfully", "image_url": file_path}

@app.get("/admin/system-stats")
def get_admin_system_stats(db: Session = Depends(get_db)):
    """Comprehensive system statistics for admin"""
    check_auction_status()
    
    # User statistics
    total_users = db.query(User).count()
    buyers_count = db.query(User).filter(User.user_type == UserType.BUYER).count()
    sellers_count = db.query(User).filter(User.user_type == UserType.SELLER).count()
    
    # Auction statistics
    total_auctions = db.query(Auction).count()
    active_auctions = db.query(Auction).filter(Auction.status == AuctionStatus.ACTIVE).count()
    completed_auctions = db.query(Auction).filter(Auction.status == AuctionStatus.WINNER_SELECTED).count()
    
    # Bid statistics
    total_bids = db.query(Bid).count()
    
    # Sales volume
    completed_auction_records = db.query(Auction).filter(
        Auction.status == AuctionStatus.WINNER_SELECTED
    ).all()
    total_sales_volume = sum(auction.current_highest_bid for auction in completed_auction_records)
    average_sale_price = total_sales_volume / len(completed_auction_records) if completed_auction_records else 0
    
    # Recent activity (last 7 days)
    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_users = db.query(User).filter(User.created_at >= week_ago).count()
    recent_auctions = db.query(Auction).filter(Auction.created_at >= week_ago).count()
    recent_bids = db.query(Bid).filter(Bid.bid_time >= week_ago).count()
    
    return {
        "users": {
            "total": total_users,
            "buyers": buyers_count,
            "sellers": sellers_count,
            "new_this_week": recent_users
        },
        "auctions": {
            "total": total_auctions,
            "active": active_auctions,
            "completed": completed_auctions,
            "new_this_week": recent_auctions
        },
        "bids": {
            "total": total_bids,
            "this_week": recent_bids
        },
        "sales": {
            "total_volume": total_sales_volume,
            "average_price": average_sale_price,
            "completed_transactions": len(completed_auction_records)
        }
    }

@app.post("/admin/resolve-dispute/{auction_id}")
def resolve_dispute(
    auction_id: int,
    action: str,  # "cancel", "extend", "force_winner"
    winner_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Admin tools to resolve disputes or manually intervene"""
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if action == "cancel":
        auction.status = AuctionStatus.ENDED
        # Notify all bidders
        bidders = db.query(Bid).filter(Bid.auction_id == auction_id).all()
        for bid in bidders:
            notification = Notification(
                user_id=bid.bidder_id,
                message=f"Auction '{auction.product_name}' has been cancelled by admin"
            )
            db.add(notification)
        
    elif action == "extend":
        # Extend auction by 1 hour
        auction.end_time = auction.end_time + timedelta(hours=1)
        auction.status = AuctionStatus.ACTIVE
        
    elif action == "force_winner" and winner_id:
        auction.winner_id = winner_id
        auction.status = AuctionStatus.WINNER_SELECTED
        
        # Create notifications
        winner_notification = Notification(
            user_id=winner_id,
            message=f"You have been declared winner of '{auction.product_name}' by admin"
        )
        seller_notification = Notification(
            user_id=auction.seller_id,
            message=f"Winner declared for '{auction.product_name}' by admin intervention"
        )
        db.add(winner_notification)
        db.add(seller_notification)
    
    db.commit()
    return {"message": f"Dispute resolved with action: {action}"}

@app.get("/buyer/won-items")
def get_buyer_won_items(user_id: int, db: Session = Depends(get_db)):
    """Get complete list of won items for buyers"""
    won_auctions = db.query(Auction).filter(Auction.winner_id == user_id).all()
    
    return [
        {
            "auction_id": auction.id,
            "product_name": auction.product_name,
            "description": auction.description,
            "winning_amount": auction.current_highest_bid,
            "seller_id": auction.seller_id,
            "end_time": auction.end_time,
            "image_url": auction.image_url
        } for auction in won_auctions
    ]

@app.get("/buyer/transaction-history")
def get_buyer_transaction_history(user_id: int, db: Session = Depends(get_db)):
    """Complete transaction history for buyers"""
    # Get all auctions where user participated
    user_bids = db.query(Bid).filter(Bid.bidder_id == user_id).all()
    auction_ids = list(set([bid.auction_id for bid in user_bids]))
    
    auctions = db.query(Auction).filter(Auction.id.in_(auction_ids)).all()
    
    transactions = []
    for auction in auctions:
        user_bids_for_auction = [bid for bid in user_bids if bid.auction_id == auction.id]
        highest_bid = max([bid.amount for bid in user_bids_for_auction])
        
        transactions.append({
            "auction_id": auction.id,
            "product_name": auction.product_name,
            "your_highest_bid": highest_bid,
            "winning_bid": auction.current_highest_bid,
            "won": auction.winner_id == current_user.id,
            "auction_status": auction.status.value,
            "end_time": auction.end_time,
            "total_bids_placed": len(user_bids_for_auction)
        })
    
    return sorted(transactions, key=lambda x: x['end_time'], reverse=True)

@app.get("/seller/earnings-summary")
def get_seller_earnings_summary(user_id: int, db: Session = Depends(get_db)):
    """Earnings summary and analytics for sellers"""
    auctions = db.query(Auction).filter(Auction.seller_id == user_id).all()
    completed_auctions = [a for a in auctions if a.status == AuctionStatus.WINNER_SELECTED]
    
    total_earnings = sum(auction.current_highest_bid for auction in completed_auctions)
    total_investment = sum(auction.base_price for auction in completed_auctions)
    total_profit = total_earnings - total_investment
    
    # Monthly breakdown (last 6 months)
    monthly_earnings = {}
    for auction in completed_auctions:
        month_key = auction.end_time.strftime("%Y-%m")
        if month_key not in monthly_earnings:
            monthly_earnings[month_key] = 0
        monthly_earnings[month_key] += auction.current_highest_bid
    
    return {
        "total_auctions": len(auctions),
        "completed_auctions": len(completed_auctions),
        "total_earnings": total_earnings,
        "total_profit": total_profit,
        "average_sale_price": total_earnings / len(completed_auctions) if completed_auctions else 0,
        "success_rate": (len(completed_auctions) / len(auctions)) * 100 if auctions else 0,
        "monthly_breakdown": monthly_earnings
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9159)