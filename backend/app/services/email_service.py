# from numpy._core import numerictypes
# from numpy._core import numerictypes
from dotenv import load_dotenv
import os
import smtplib
from email.message import EmailMessage


load_dotenv()


EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

print("EMAIL ADDRESS:", EMAIL_ADDRESS)
print("PASSWORD LOADED:", EMAIL_PASSWORD is not None)

def send_email_verification(to_email: str, otp: str):
    message = EmailMessage()

    message["Subject"] = "Verufy your email"
    message["From"] = EMAIL_ADDRESS
    message["To"] = to_email

    message.set_content(
        f"Your verification code is : {otp}\n, will expire in 10 minutes"
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        # Login to your Gmail account using the App Password
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)

        # Send the email
        smtp.send_message(message)
