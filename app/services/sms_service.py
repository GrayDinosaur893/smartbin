import os
import logging
import urllib.request
import urllib.parse
import json
from datetime import datetime

# Set up logging for SMS Service
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SMSService")

class SMSService:
    # Target admin alert phone number (Loaded from environment variable)
    ADMIN_SMS_TARGET = os.environ.get("TARGET_SMS_PHONE", "8085668669")
    SMS_LOGS = []

    @classmethod
    def generate_free_cellular_links(cls, phone_number: str, message_text: str) -> dict:
        """
        Generates 100% FREE 1-click Native SMS & WhatsApp Cellular Dispatch Links for Indian mobile numbers.
        Allows citizens and admins to dispatch alerts instantly without paid third-party gateways.
        """
        clean_phone = phone_number.replace("+91", "").replace("-", "").strip()
        encoded_msg = urllib.parse.quote(message_text)

        return {
            'target_phone': clean_phone,
            'sms_uri': f"sms:{clean_phone}?body={encoded_msg}",
            'whatsapp_url': f"https://api.whatsapp.com/send?phone=91{clean_phone}&text={encoded_msg}",
            'telegram_url': f"https://t.me/share/url?url={encoded_msg}"
        }

    @classmethod
    def send_sms(cls, recipient_phone: str, message_body: str) -> dict:
        """
        Processes and logs SMS notifications, generating 1-click cellular & WhatsApp links.
        """
        free_links = cls.generate_free_cellular_links(recipient_phone, message_body)

        sms_record = {
            'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            'recipient': recipient_phone,
            'message': message_body,
            'status': '1-CLICK FREE CELLULAR SMS & WHATSAPP READY',
            'gateway': 'SMARTBIN_1CLICK_FREE_CELLULAR_GATEWAY',
            'free_links': free_links
        }
        cls.SMS_LOGS.append(sms_record)

        logger.info(f"==================================================")
        logger.info(f"[1-CLICK SMS DISPATCH TO {recipient_phone}]")
        logger.info(f"MESSAGE: {message_body}")
        logger.info(f"SMS URI: {free_links['sms_uri']}")
        logger.info(f"==================================================")
        print(f"\n[1-CLICK FREE SMS READY] -> {recipient_phone}: {message_body}\n")

        return sms_record

    @classmethod
    def send_report_confirmation_sms(cls, report_code: str, city_name: str, waste_type: str, eco_points: int = 100, user_phone: str = None) -> list:
        """
        Sends automated 1-click SMS notifications when a report is successful.
        """
        recipients = [cls.ADMIN_SMS_TARGET]
        if user_phone and user_phone != cls.ADMIN_SMS_TARGET:
            recipients.append(user_phone)

        sms_body = (
            f"[SMARTBIN CG] Waste Report Successful! Code: {report_code} | "
            f"City: {city_name} Municipal Corp | Waste: {waste_type} | "
            f"Eco-Points: +{eco_points} Pts (Rs. 1.00 Cash). Clean CG Helpline: 1800-233-1042"
        )

        results = []
        for phone in recipients:
            res = cls.send_sms(recipient_phone=phone, message_body=sms_body)
            results.append(res)

        return results

