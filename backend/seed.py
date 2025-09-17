from datetime import datetime, timedelta
from typing import List

from main import (
    SessionLocal,
    Base,
    engine,
    User,
    Auction,
    Bid,
    Notification,
    UserType,
    AuctionStatus,
    hash_password,
)


def reset_database() -> None:
    """Drop and recreate all tables for a clean seed."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_users(db) -> dict:
    """Create admin, sellers, and buyers."""
    admin = User(
        email="admin@example.com",
        hashed_password=hash_password("admin123"),
        user_type=UserType.ADMIN,
    )

    sellers: List[User] = [
        User(
            email="seller.alice@example.com",
            hashed_password=hash_password("seller123"),
            user_type=UserType.SELLER,
        ),
        User(
            email="seller.bob@example.com",
            hashed_password=hash_password("seller123"),
            user_type=UserType.SELLER,
        ),
        User(
            email="seller.cara@example.com",
            hashed_password=hash_password("seller123"),
            user_type=UserType.SELLER,
        ),
    ]

    buyers: List[User] = [
        User(
            email="buyer.charlie@example.com",
            hashed_password=hash_password("buyer123"),
            user_type=UserType.BUYER,
        ),
        User(
            email="buyer.diana@example.com",
            hashed_password=hash_password("buyer123"),
            user_type=UserType.BUYER,
        ),
        User(
            email="buyer.erin@example.com",
            hashed_password=hash_password("buyer123"),
            user_type=UserType.BUYER,
        ),
        User(
            email="buyer.felix@example.com",
            hashed_password=hash_password("buyer123"),
            user_type=UserType.BUYER,
        ),
        User(
            email="buyer.gwen@example.com",
            hashed_password=hash_password("buyer123"),
            user_type=UserType.BUYER,
        ),
    ]

    db.add(admin)
    for u in sellers + buyers:
        db.add(u)
    db.commit()

    # refresh to get ids
    db.refresh(admin)
    for u in sellers + buyers:
        db.refresh(u)

    return {
        "admin": admin,
        "sellers": sellers,
        "buyers": buyers,
        "credentials": [
            (admin.email, "admin123", admin.user_type.value),
            *[(u.email, "seller123", u.user_type.value) for u in sellers],
            *[(u.email, "buyer123", u.user_type.value) for u in buyers],
        ],
    }


def seed_auctions_and_bids(db, sellers: List[User], buyers: List[User], total_target: int = 20) -> List[Auction]:
    """Create ~total_target auctions across all statuses with bids/notifications."""
    now = datetime.utcnow()

    auctions: List[Auction] = []

    def add_bids(auction: Auction, base: float, active: bool, winner: bool) -> None:
        """Attach bids to auction and adjust status/highest bid; create notifications."""
        incremental_bids = [base * 1.05, base * 1.12, base * 1.2]
        # Rotate buyers for variety
        for i, amount in enumerate(incremental_bids):
            bidder = buyers[i % len(buyers)]
            db.add(Bid(amount=round(amount, 2), bidder_id=bidder.id, auction_id=auction.id))
        # Add a final higher bid sometimes
        final_bidder = buyers[(len(auction.product_name) + int(auction.id or 0)) % len(buyers)]
        final_amount = round(base * 1.3, 2)
        db.add(Bid(amount=final_amount, bidder_id=final_bidder.id, auction_id=auction.id))

        auction.current_highest_bid = final_amount
        db.add(
            Notification(
                user_id=auction.seller_id,
                message=f"New bid of ${final_amount} placed on your auction '{auction.product_name}'",
            )
        )

        if winner:
            # finalize winner
            top_bid = (
                db.query(Bid)
                .filter(Bid.auction_id == auction.id)
                .order_by(Bid.amount.desc())
                .first()
            )
            if top_bid:
                auction.winner_id = top_bid.bidder_id
                auction.status = AuctionStatus.WINNER_SELECTED
                db.add(
                    Notification(
                        user_id=top_bid.bidder_id,
                        message=(
                            f"Congratulations! You won the auction for {auction.product_name} with a bid of ${top_bid.amount}"
                        ),
                    )
                )
                db.add(
                    Notification(
                        user_id=auction.seller_id,
                        message=(
                            f"Your auction for {auction.product_name} has ended. Winner: User {top_bid.bidder_id} with ${top_bid.amount}"
                        ),
                    )
                )

    # Helper to create and persist auction
    def create_auction(product_name: str, description: str, base_price: float, start_offset: timedelta, end_offset: timedelta, status: AuctionStatus, seller_id: int, image_name: str) -> Auction:
        a = Auction(
            product_name=product_name,
            description=description,
            base_price=base_price,
            current_highest_bid=base_price,
            start_time=now + start_offset,
            end_time=now + end_offset,
            status=status,
            image_url=f"uploads/{image_name}",
            seller_id=seller_id,
        )
        db.add(a)
        db.commit()
        db.refresh(a)
        auctions.append(a)
        return a

    # Distribute counts: 5 CREATED, 7 ACTIVE, 4 ENDED, 4 WINNER_SELECTED
    created_specs = [
        ("Vintage Camera", "Classic 35mm camera.", 120.0, timedelta(hours=2), timedelta(days=1), AuctionStatus.CREATED, "sample_camera.jpg"),
        ("Wireless Headphones", "Noise cancelling over-ear.", 90.0, timedelta(hours=3), timedelta(days=2), AuctionStatus.CREATED, "sample_headphones.jpg"),
        ("Mechanical Keyboard", "RGB, Blue switches.", 70.0, timedelta(hours=5), timedelta(days=2, hours=3), AuctionStatus.CREATED, "sample_keyboard.jpg"),
        ("4K Monitor", "27-inch IPS panel.", 220.0, timedelta(hours=6), timedelta(days=3), AuctionStatus.CREATED, "sample_monitor.jpg"),
        ("Drone Kit", "4K camera drone.", 300.0, timedelta(hours=8), timedelta(days=3, hours=4), AuctionStatus.CREATED, "sample_drone.jpg"),
    ]

    active_specs = [
        ("Gaming Laptop", "RTX, 16GB RAM, 1TB SSD.", 800.0, timedelta(hours=-3), timedelta(hours=4), AuctionStatus.ACTIVE, "sample_laptop.jpg"),
        ("Smartwatch", "Waterproof, GPS.", 150.0, timedelta(hours=-2), timedelta(hours=6), AuctionStatus.ACTIVE, "sample_watch.jpg"),
        ("Electric Scooter", "25km range.", 350.0, timedelta(hours=-5), timedelta(hours=5), AuctionStatus.ACTIVE, "sample_scooter.jpg"),
        ("Bluetooth Speaker", "Portable, 20W.", 45.0, timedelta(hours=-1), timedelta(hours=7), AuctionStatus.ACTIVE, "sample_speaker.jpg"),
        ("DSLR Camera", "APS-C with lens.", 400.0, timedelta(hours=-4), timedelta(hours=10), AuctionStatus.ACTIVE, "sample_dslr.jpg"),
        ("VR Headset", "PC VR system.", 250.0, timedelta(hours=-6), timedelta(hours=3), AuctionStatus.ACTIVE, "sample_vr.jpg"),
        ("Graphic Tablet", "12-inch display.", 180.0, timedelta(hours=-3), timedelta(hours=8), AuctionStatus.ACTIVE, "sample_tablet.jpg"),
    ]

    ended_specs = [
        ("Antique Vase", "Porcelain vase.", 200.0, timedelta(days=-2), timedelta(hours=-1), AuctionStatus.ENDED, "sample_vase.jpg"),
        ("Retro Console", "Classic games.", 130.0, timedelta(days=-1, hours=-6), timedelta(hours=-2), AuctionStatus.ENDED, "sample_console.jpg"),
        ("Mountain Bike", "21-speed.", 220.0, timedelta(days=-3), timedelta(hours=-5), AuctionStatus.ENDED, "sample_bike.jpg"),
        ("Coffee Machine", "Espresso maker.", 140.0, timedelta(days=-2, hours=-3), timedelta(hours=-6), AuctionStatus.ENDED, "sample_coffee.jpg"),
    ]

    winner_specs = [
        ("Smartphone Pro Max", "Latest model 256GB.", 600.0, timedelta(days=-3), timedelta(days=-1, hours=-2), AuctionStatus.ENDED, "sample_phone.jpg"),
        ("Tablet Pro", "11-inch, 128GB.", 350.0, timedelta(days=-4), timedelta(days=-2), AuctionStatus.ENDED, "sample_tabletpro.jpg"),
        ("Noise-cancel Buds", "In-ear ANC.", 80.0, timedelta(days=-5), timedelta(days=-3), AuctionStatus.ENDED, "sample_buds.jpg"),
        ("E-reader", "Backlit display.", 90.0, timedelta(days=-6), timedelta(days=-4), AuctionStatus.ENDED, "sample_ereader.jpg"),
    ]

    # Create CREATED auctions
    for idx, (name, desc, price, so, eo, status, img) in enumerate(created_specs):
        seller = sellers[idx % len(sellers)]
        a = create_auction(name, desc, price, so, eo, status, seller.id, img)

    # Create ACTIVE auctions and add bids
    for idx, (name, desc, price, so, eo, status, img) in enumerate(active_specs):
        seller = sellers[(idx + 1) % len(sellers)]
        a = create_auction(name, desc, price, so, eo, status, seller.id, img)
        add_bids(a, price, active=True, winner=False)
        db.commit()

    # Create ENDED auctions and add bids (no winner selected)
    for idx, (name, desc, price, so, eo, status, img) in enumerate(ended_specs):
        seller = sellers[(idx + 2) % len(sellers)]
        a = create_auction(name, desc, price, so, eo, status, seller.id, img)
        add_bids(a, price, active=False, winner=False)
        a.status = AuctionStatus.ENDED
        db.commit()

    # Create auctions and finalize winners
    for idx, (name, desc, price, so, eo, status, img) in enumerate(winner_specs):
        seller = sellers[idx % len(sellers)]
        a = create_auction(name, desc, price, so, eo, status, seller.id, img)
        add_bids(a, price, active=False, winner=True)
        db.commit()

    # If fewer than total_target were created, add a few simple CREATED to hit target
    while len(auctions) < total_target:
        idx = len(auctions)
        seller = sellers[idx % len(sellers)]
        extra = create_auction(
            product_name=f"Accessory Bundle #{idx}",
            description="Mixed tech accessories.",
            base_price=25.0 + (idx % 5) * 5.0,
            start_offset=timedelta(hours=12 + idx),
            end_offset=timedelta(days=2, hours=idx),
            status=AuctionStatus.CREATED,
            seller_id=seller.id,
            image_name="sample_accessories.jpg",
        )
        db.commit()

    return auctions


def main() -> None:
    reset_database()
    db = SessionLocal()
    try:
        users = seed_users(db)
        auctions = seed_auctions_and_bids(db, users["sellers"], users["buyers"], total_target=20)

        # A few extra notifications for flavor
        db.add(
            Notification(
                user_id=users["buyers"][0].id,
                message="Welcome to the auction platform!",
            )
        )
        db.add(
            Notification(
                user_id=users["sellers"][0].id,
                message="Your seller account is ready. Create your first auction!",
            )
        )
        db.commit()

        print("Seeding complete:")
        print(f"- Admin users: 1")
        print(f"- Sellers: {len(users['sellers'])}")
        print(f"- Buyers: {len(users['buyers'])}")
        print(f"- Auctions: {len(auctions)} (~20 across CREATED, ACTIVE, ENDED, WINNER_SELECTED)")

        print("\nUser credentials (email / password / role):")
        for email, pwd, role in users["credentials"]:
            print(f"- {email} / {pwd} / {role}")
    finally:
        db.close()


if __name__ == "__main__":
    main()


