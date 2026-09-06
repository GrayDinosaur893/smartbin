import os
import logging
import urllib.request
import urllib.parse
import json
from datetime import datetime

# Set up logging for SMS Service
logging.basicConfig(level=logging.INFO)
logger = logger = logging.getLogger("SMSService")

class SMSService:
    # Target admin alert phone number (Loaded from environment variable)
    ADMIN_SMS_TARGET = os.environ.get("TARGET_SMS_PHONE", "9876543210")
    SMS_LOGS = []
    
    # Fast2SMS API Key (Environment variable or fallback)
    FAST2SMS_API_KEY = os.environ.get("FAST2SMS_API_KEY", "e0Sv4Gqof6WBkcgspt2zCaHl3TUOXuPNRI98ZYKhQnidVADFr1XFDnh61q8Sy0pJCAVl34ztvUbs9kgi")

    @classmethod
    def set_api_key(cls, api_key: str):
        cls.FAST2SMS_API_KEY = api_key.strip()

    @classmethod
    def generate_free_cellular_links(cls, phone_number: str, message_text: str) -> dict:
        """
        Generates 100% FREE 1-click Native SMS & WhatsApp Cellular Dispatch Links for Indian mobile numbers.
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
    def send_real_cellular_sms(cls, recipient_phone: str, message_body: str) -> dict:
        """
        Attempts real physical cellular SMS dispatch via Fast2SMS Indian SMS Gateway REST API.
        """
        clean_phone = recipient_phone.replace("+91", "").replace("-", "").strip()
        
        if not cls.FAST2SMS_API_KEY:
            return {'success': False, 'reason': 'Fast2SMS API Key not set. Free SMS fallback active.'}

        encoded_msg = urllib.parse.quote(message_body)
        url = f"https://www.fast2sms.com/dev/bulkV2?authorization={cls.FAST2SMS_API_KEY}&route=q&message={encoded_msg}&language=english&flash=0&numbers={clean_phone}"
        
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode('utf-8')
                res_json = json.loads(res_body)
                logger.info(f"Fast2SMS API Response: {res_json}")
                if res_json.get('return'):
                    return {'success': True, 'gateway': 'Fast2SMS Cellular Gateway', 'response': res_json}
                else:
                    return {'success': False, 'reason': res_json.get('message', 'SMS Gateway Error')}
        except urllib.error.HTTPError as he:
            try:
                err_body = he.read().decode('utf-8')
                err_json = json.loads(err_body)
                msg = err_json.get('message', str(he))
                logger.warning(f"Fast2SMS Gateway Notice: {msg}")
                return {'success': False, 'reason': f"Fast2SMS: {msg}"}
            except Exception:
                return {'success': False, 'reason': f"HTTP {he.code}: {he.reason}"}
        except Exception as e:
            logger.error(f"Fast2SMS cellular SMS dispatch exception: {e}")
            return {'success': False, 'reason': str(e)}

    @classmethod
    def send_sms(cls, recipient_phone: str, message_body: str) -> dict:
        """
        Sends an SMS notification to the target recipient phone number.
        """
        cellular_res = cls.send_real_cellular_sms(recipient_phone, message_body)
        free_links = cls.generate_free_cellular_links(recipient_phone, message_body)

        sms_record = {
            'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            'recipient': recipient_phone,
            'message': message_body,
            'status': 'CELLULAR SMS DISPATCHED' if cellular_res['success'] else '100% FREE MOBILE SMS & WHATSAPP READY',
            'gateway': cellular_res.get('gateway', 'SMARTBIN_FREE_CELLULAR_GATEWAY'),
            'cellular_sent': cellular_res['success'],
            'free_links': free_links,
            'gateway_details': cellular_res
        }
        cls.SMS_LOGS.append(sms_record)

        logger.info(f"==================================================")
        logger.info(f"[SMS DISPATCH TO {recipient_phone}]")
        logger.info(f"MESSAGE: {message_body}")
        logger.info(f"STATUS: {sms_record['status']}")
        logger.info(f"==================================================")
        print(f"\n[FREE SMS / WHATSAPP READY] -> {recipient_phone}: {message_body}\n")

        return sms_record

    @classmethod
    def send_report_confirmation_sms(cls, report_code: str, city_name: str, waste_type: str, eco_points: int = 100, user_phone: str = None) -> list:
        """
        Sends automated SMS notifications to 8085668669 and the citizen when a report is successful.
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
