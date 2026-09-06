import random
import uuid
from app.database import db
from app.models.models import User, RewardsLedger, Report, SponsorOffer, VoucherRedemption

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

    @classmethod
    def redeem_sponsor_voucher(cls, user_id: int, sponsor_offer_id: int) -> dict:
        """
        Deducts points from citizen balance and enforces 1-time single redemption rule per sponsor offer.
        """
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'error': 'Please login to redeem sponsor vouchers!'}

        sponsor = SponsorOffer.query.get(sponsor_offer_id)
        if not sponsor:
            return {'success': False, 'error': 'Sponsor offer not found!'}

        # 1-TIME REDEMPTION CHECK
        existing_redemption = VoucherRedemption.query.filter_by(user_id=user_id, sponsor_offer_id=sponsor_offer_id).first()
        if existing_redemption:
            return {
                'success': False,
                'error': f'You have already redeemed this voucher code ({existing_redemption.voucher_code})! Limit: 1 Redemption per Citizen.',
                'already_redeemed': True,
                'existing_code': existing_redemption.voucher_code
            }

        # POINTS BALANCE CHECK
        points_needed = sponsor.points_required
        if user.eco_points < points_needed:
            return {
                'success': False,
                'error': f'Insufficient Eco-Points! You need {points_needed} Pts, but you currently have {user.eco_points} Pts.'
            }

        # DEDUCT POINTS & UPDATE WALLET
        user.eco_points -= points_needed
        cash_deducted = points_needed * cls.POINT_TO_CASH_RATE
        user.cash_wallet_balance = max(0.0, user.cash_wallet_balance - cash_deducted)

        # GENERATE UNIQUE PROMO VOUCHER CODE WITH UUID
        unique_suffix = uuid.uuid4().hex[:8].upper()
        prefix = sponsor.voucher_code_prefix if sponsor.voucher_code_prefix else "VCH-CG-2026-"
        voucher_code = f"{prefix}{unique_suffix}"

        # RECORD IN REDEMPTION & REWARDS LEDGER
        redemption_record = VoucherRedemption(
            user_id=user_id,
            sponsor_offer_id=sponsor_offer_id,
            voucher_code=voucher_code,
            points_spent=points_needed
        )
        db.session.add(redemption_record)

        ledger_entry = RewardsLedger(
            user_id=user_id,
            points_earned=-points_needed,
            cash_earned=-cash_deducted,
            transaction_type="sponsor_voucher_redeemed",
            description=f"🎟️ Redeemed Sponsor Voucher: {sponsor.offer_title} (-{points_needed} Pts)"
        )
        db.session.add(ledger_entry)
        db.session.commit()

        return {
            'success': True,
            'message': f'Successfully redeemed {sponsor.offer_title}!',
            'voucher_code': voucher_code,
            'points_spent': points_needed,
            'remaining_points': user.eco_points,
            'remaining_wallet': user.cash_wallet_balance,
            'sponsor': {
                'company_name': sponsor.company_name,
                'offer_title': sponsor.offer_title
            }
        }

    @classmethod
    def redeem_custom_voucher(cls, user_id: int, voucher_prefix: str, points_cost: int, offer_title: str) -> dict:
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'error': 'User not found!'}

        if user.eco_points < points_cost:
            return {
                'success': False,
                'error': f'Insufficient Eco-Points! You need {points_cost} Pts, but you currently have {user.eco_points} Pts.'
            }

        # Deduct Eco-Points & Cash Wallet Balance
        user.eco_points -= points_cost
        cash_deducted = points_cost * cls.POINT_TO_CASH_RATE
        user.cash_wallet_balance = max(0.0, user.cash_wallet_balance - cash_deducted)

        # Generate Unique Promo Voucher Code with UUID
        unique_suffix = uuid.uuid4().hex[:8].upper()
        prefix = voucher_prefix if voucher_prefix else "CG-GOVT-"
        if not prefix.endswith('-'):
            prefix += '-'
        voucher_code = f"{prefix}{unique_suffix}"

        # Record in VoucherRedemption
        redemption_record = VoucherRedemption(
            user_id=user_id,
            sponsor_offer_id=None,
            voucher_code=voucher_code,
            points_spent=points_cost
        )
        db.session.add(redemption_record)

        # Record in RewardsLedger
        ledger_entry = RewardsLedger(
            user_id=user_id,
            points_earned=-points_cost,
            cash_earned=-cash_deducted,
            transaction_type="municipal_voucher_redeemed",
            description=f"🎟️ Claimed Municipal Voucher: {offer_title} (-{points_cost} Pts)"
        )
        db.session.add(ledger_entry)
        db.session.commit()

        return {
            'success': True,
            'message': f'Successfully claimed {offer_title}!',
            'voucher_code': voucher_code,
            'points_spent': points_cost,
            'remaining_points': user.eco_points,
            'remaining_wallet': user.cash_wallet_balance,
            'offer_title': offer_title
        }

