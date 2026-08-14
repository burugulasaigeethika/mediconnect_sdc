from celery_app import app
import time
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Mock Email Task
@app.task(name='tasks.send_welcome_email')
def send_welcome_email(email, name):
    print(f"Adding email task for {email}...")
    # Simulate processing time
    time.sleep(2)
    
    # In a real app, you would use smtplib here using env vars
    # email_user = os.getenv('EMAIL_USER')
    # email_pass = os.getenv('EMAIL_PASS')
    
    print(f"📧 EMAIL SENT: Welcome to MediConnect, {name}!")
    return f"Welcome email sent to {email}"

# Report Generation Task
@app.task(name='tasks.generate_monthly_report')
def generate_monthly_report(report_type):
    print(f"Generating {report_type} report...")
    time.sleep(5)  # Simulate heavy processing
    
    # Logic to connect to MongoDB and aggregate data could go here
    # from pymongo import MongoClient
    # client = MongoClient(os.getenv('MONGO_URI'))
    
    filename = f"{report_type}_report_{int(time.time())}.pdf"
    print(f"📄 REPORT GENERATED: {filename}")
    return {"status": "completed", "file": filename}

# Periodic Task Example
@app.task
def check_system_health():
    print("💓 System health check: OK")
    return "Health OK"
