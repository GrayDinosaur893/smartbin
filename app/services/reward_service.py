from app.database import db
from app.models.models import User, RewardsLedger, Report

class RewardService:
    # 100 Eco-Points = ₹1.00 Cash Reward (1 Pt = ₹0.01)
    POINT_TO_CASH_RATE = 0.01

    @classmethod
    def award_points_and_cash(cls, user_id, points, transaction_type, description):
        user = User.query.get(user_id)
        if not user:
            return False

        cash_earned = points * cls.POINT_TO_CASH_RATE  # 100 points = ₹1.00

        user.eco_points += points
        user.cash_wallet_balance += cash_earned

        ledger_entry = RewardsLedger(
            user_id=user_id,
            points_earned=points,
            cash_earned=cash_earned,
            transaction_type=transaction_type,
            description=f"{description} (+{points} Pts = ₹{cash_earned:.2f})"
        )
        db.session.add(ledger_entry)

        # Check total verified reports milestone (100 Verified Reports)
        verified_count = Report.query.filter_by(citizen_id=user_id, status='verified').count() + \
                         Report.query.filter_by(citizen_id=user_id, status='completed').count()

        if verified_count >= 100:
            existing_voucher = RewardsLedger.query.filter_by(user_id=user_id, transaction_type="milestone_100_voucher").first()
            if not existing_voucher:
                milestone_entry = RewardsLedger(
                    user_id=user_id,
                    points_earned=1000,
                    cash_earned=10.0,
                    transaction_type="milestone_100_voucher",
                    description="🎟️ 100 Verified Reports Milestone: Official Government Subsidy & Municipal Tax Rebate Voucher Issued!"
                )
                user.eco_points += 1000
                user.cash_wallet_balance += 10.0
                db.session.add(milestone_entry)

        db.session.commit()
        return True
