from pymongo import MongoClient
import random
import os
import re
from faker import Faker
from datetime import datetime

# Connect to local MongoDB server
client = MongoClient("mongodb://localhost:27017")
db = client["financial_rag"]

# Dummy data generator
faker = Faker()

def parse_user_data():
    """Parses the user_data.txt file and extracts structured information."""
    
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "user_data.txt")
    
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Parse different sections
    sections = {
        "personal_life_events": re.findall(r'### (.*?)\nFrom: (.*?)\nDate: (.*?)\nSubject: (.*?)\n\n(.*?)\n\n(?:Best|Thanks|Regards),\n(.*?)(?=\n\n###|\n\n##|$)', content, re.DOTALL),
        "banking_notifications": re.findall(r'### (.*?) - (.*?)\nFrom: (.*?)\nDate: (.*?)\nSubject: (.*?)\n\n(.*?)(?=\n\n###|\n\n##|$)', content, re.DOTALL),
        "credit_card_statements": re.findall(r'### (.*?) - (.*?)\nFrom: (.*?)\nDate: (.*?)\nSubject: (.*?)\n\n(.*?)(?=\n\n###|\n\n##|$)', content, re.DOTALL),
        "loan_notifications": re.findall(r'### (.*?) - (.*?)\nFrom: (.*?)\nDate: (.*?)\nSubject: (.*?)\n\n(.*?)(?=\n\n###|\n\n##|$)', content, re.DOTALL),
        "investment_updates": re.findall(r'### (.*?) - (.*?)\nFrom: (.*?)\nDate: (.*?)\nSubject: (.*?)\n\n(.*?)(?=\n\n###|\n\n##|$)', content, re.DOTALL),
        "bills_utilities": re.findall(r'### (.*?) - (.*?)\nFrom: (.*?)\nDate: (.*?)\nSubject: (.*?)\n\n(.*?)(?=\n\n###|\n\n##|$)', content, re.DOTALL),
        "tax_notifications": re.findall(r'### (.*?) - (.*?)\nFrom: (.*?)\nDate: (.*?)\nSubject: (.*?)\n\n(.*?)(?=\n\n###|\n\n##|$)', content, re.DOTALL),
    }
    
    return sections

def populate_db():
    """Populates MongoDB collections with financial data from user_data.txt."""
    
    # First, drop existing collections to avoid duplicates
    db.messages.drop()
    db.emails.drop()
    db.personal_data.drop()
    db.life_events.drop()
    db.banking.drop()
    db.credit_cards.drop()
    db.loans.drop()
    db.investments.drop()
    db.bills.drop()
    db.taxes.drop()
    
    # Parse user data
    user_data = parse_user_data()
    
    # Generate user IDs for each email/name
    email_to_id = {}
    user_counter = 1
    
    # Insert original dummy data for compatibility
    messages = [
        {"user_id": i, "content": f"Bought {random.randint(1, 10)} shares of Tesla (TSLA) at ${random.randint(100, 300)}"} for i in range(1, 10)
    ]
    db.messages.insert_many(messages)
    
    # Insert original emails
    emails = [
        {"user_id": i, "subject": "Stock Alert", "body": f"Your stock {faker.company()} gained {random.randint(5, 15)}% today."}
        for i in range(1, 10)
    ]
    db.emails.insert_many(emails)
    
    # Insert original personal data
    personal_data = [
        {"user_id": i, "age": random.randint(20, 60), "risk_profile": random.choice(["conservative", "moderate", "aggressive"])}
        for i in range(1, 10)
    ]
    db.personal_data.insert_many(personal_data)
    
    # Process life events
    life_events = []
    for event in user_data["personal_life_events"]:
        event_type, email, date, subject, body, name = event
        
        if email not in email_to_id:
            email_to_id[email] = user_counter
            user_counter += 1
        
        user_id = email_to_id[email]
        
        # Convert date string to datetime object
        try:
            date_obj = datetime.strptime(date, "%B %d, %Y")
        except:
            date_obj = datetime.now()
        
        life_events.append({
            "user_id": user_id,
            "event_type": event_type,
            "email": email,
            "date": date_obj,
            "subject": subject,
            "body": body.strip(),
            "name": name
        })
    
    if life_events:
        db.life_events.insert_many(life_events)
    
    # Process banking notifications
    banking = []
    for notification in user_data["banking_notifications"]:
        notif_type, bank, email, date, subject, body = notification
        
        if email not in email_to_id:
            email_to_id[email] = user_counter
            user_counter += 1
        
        user_id = email_to_id[email]
        
        # Extract account number if present
        account_match = re.search(r'account ending in (\d+)', body)
        account_number = account_match.group(1) if account_match else None
        
        # Extract amount if present
        amount_match = re.search(r'\$([0-9,]+\.\d+)', body)
        amount = float(amount_match.group(1).replace(',', '')) if amount_match else None
        
        banking.append({
            "user_id": user_id,
            "notification_type": notif_type,
            "bank": bank,
            "email": email,
            "date": datetime.strptime(date, "%B %d, %Y"),
            "subject": subject,
            "body": body.strip(),
            "account_number": account_number,
            "amount": amount
        })
    
    if banking:
        db.banking.insert_many(banking)
    
    # Process credit card statements
    credit_cards = []
    for statement in user_data["credit_card_statements"]:
        statement_type, provider, email, date, subject, body = statement
        
        if email not in email_to_id:
            email_to_id[email] = user_counter
            user_counter += 1
        
        user_id = email_to_id[email]
        
        # Extract account number if present
        account_match = re.search(r'(?:Card|account) ending in (\d+)', body)
        account_number = account_match.group(1) if account_match else None
        
        # Extract amount if present
        amount_match = re.search(r'\$([0-9,]+\.\d+)', body)
        amount = float(amount_match.group(1).replace(',', '')) if amount_match else None
        
        credit_cards.append({
            "user_id": user_id,
            "statement_type": statement_type,
            "provider": provider,
            "email": email,
            "date": datetime.strptime(date, "%B %d, %Y"),
            "subject": subject,
            "body": body.strip(),
            "account_number": account_number,
            "amount": amount
        })
    
    if credit_cards:
        db.credit_cards.insert_many(credit_cards)
    
    # Process loan notifications
    loans = []
    for notification in user_data["loan_notifications"]:
        loan_type, provider, email, date, subject, body = notification
        
        if email not in email_to_id:
            email_to_id[email] = user_counter
            user_counter += 1
        
        user_id = email_to_id[email]
        
        # Extract loan number if present
        loan_match = re.search(r'[Ll]oan (?:[Nn]umber|#): ?([A-Z0-9\-]+)', body)
        loan_number = loan_match.group(1) if loan_match else None
        
        # Extract payment amount if present
        payment_match = re.search(r'\$([0-9,]+\.\d+)', body)
        payment = float(payment_match.group(1).replace(',', '')) if payment_match else None
        
        loans.append({
            "user_id": user_id,
            "loan_type": loan_type,
            "provider": provider,
            "email": email,
            "date": datetime.strptime(date, "%B %d, %Y"),
            "subject": subject,
            "body": body.strip(),
            "loan_number": loan_number,
            "payment_amount": payment
        })
    
    if loans:
        db.loans.insert_many(loans)
    
    # Process investment updates
    investments = []
    for update in user_data["investment_updates"]:
        update_type, provider, email, date, subject, body = update
        
        if email not in email_to_id:
            email_to_id[email] = user_counter
            user_counter += 1
        
        user_id = email_to_id[email]
        
        # Extract account number if present
        account_match = re.search(r'[Aa]ccount(?:.*?)(?:#|:) ?([A-Z0-9\-]+)', body)
        account_number = account_match.group(1) if account_match else None
        
        # Extract amount if present
        amount_match = re.search(r'\$([0-9,]+\.\d+)', body)
        amount = float(amount_match.group(1).replace(',', '')) if amount_match else None
        
        investments.append({
            "user_id": user_id,
            "update_type": update_type,
            "provider": provider,
            "email": email,
            "date": datetime.strptime(date, "%B %d, %Y"),
            "subject": subject,
            "body": body.strip(),
            "account_number": account_number,
            "amount": amount
        })
    
    if investments:
        db.investments.insert_many(investments)
    
    # Process bills and utilities
    bills = []
    for bill in user_data["bills_utilities"]:
        bill_type, provider, email, date, subject, body = bill
        
        if email not in email_to_id:
            email_to_id[email] = user_counter
            user_counter += 1
        
        user_id = email_to_id[email]
        
        # Extract account number if present
        account_match = re.search(r'[Aa]ccount (?:[Nn]umber|#): ?([A-Z0-9]+)', body)
        account_number = account_match.group(1) if account_match else None
        
        # Extract amount if present
        amount_match = re.search(r'\$([0-9,]+\.\d+)', body)
        amount = float(amount_match.group(1).replace(',', '')) if amount_match else None
        
        # Extract due date if present
        due_date_match = re.search(r'[Dd]ue [Dd]ate: (.*?)(?:\n|$)', body)
        due_date = due_date_match.group(1).strip() if due_date_match else None
        
        bills.append({
            "user_id": user_id,
            "bill_type": bill_type,
            "provider": provider,
            "email": email,
            "date": datetime.strptime(date, "%B %d, %Y"),
            "subject": subject,
            "body": body.strip(),
            "account_number": account_number,
            "amount": amount,
            "due_date": due_date
        })
    
    if bills:
        db.bills.insert_many(bills)
    
    # Process tax notifications
    taxes = []
    for notification in user_data["tax_notifications"]:
        tax_type, provider, email, date, subject, body = notification
        
        if email not in email_to_id:
            email_to_id[email] = user_counter
            user_counter += 1
        
        user_id = email_to_id[email]
        
        # Extract amount if present
        amount_match = re.search(r'\$([0-9,]+\.\d+)', body)
        amount = float(amount_match.group(1).replace(',', '')) if amount_match else None
        
        taxes.append({
            "user_id": user_id,
            "tax_type": tax_type,
            "provider": provider,
            "email": email,
            "date": datetime.strptime(date, "%B %d, %Y"),
            "subject": subject,
            "body": body.strip(),
            "amount": amount
        })
    
    if taxes:
        db.taxes.insert_many(taxes)
    
    print("✅ Database populated with real user financial data!")

# Run the script
if __name__ == "__main__":
    populate_db()
