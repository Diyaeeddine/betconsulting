import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

def test_smtp_server():
    """
    Tests SMTP server settings by sending a test email.
    Loads configuration from a .env file.
    """
    # Load environment variables from .env file
    load_dotenv()

    # --- Configuration ---
    # Fetch settings from environment variables
    mailer = os.getenv("MAIL_MAILER")
    host = os.getenv("MAIL_HOST")
    port_str = os.getenv("MAIL_PORT")
    username = os.getenv("MAIL_USERNAME")
    password = os.getenv("MAIL_PASSWORD")
    encryption = os.getenv("MAIL_ENCRYPTION", "none").lower() # Default to 'none' if not set
    from_addr = os.getenv("MAIL_FROM_ADDRESS")
    from_name = os.getenv("MAIL_FROM_NAME")

    # --- Input Validation ---
    if not all([mailer, host, port_str, username, password, from_addr, from_name]):
        print("❌ Error: One or more required environment variables are missing.")
        print("Please ensure your .env file contains all required MAIL_* variables.")
        return

    try:
        port = int(port_str)
    except (ValueError, TypeError):
        print(f"❌ Error: Invalid MAIL_PORT '{port_str}'. It must be a number.")
        return

    # Prompt for the recipient's email address
    to_addr = input("📧 Enter the recipient's email address for the test: ")
    if not to_addr:
        print("❌ Error: Recipient email address cannot be empty.")
        return

    print("\n--- SMTP Test ---")
    print(f"Host: {host}:{port}")
    print(f"Username: {username}")
    print(f"Encryption: {encryption.upper()}")
    print(f"From: \"{from_name}\" <{from_addr}>")
    print(f"To: {to_addr}")
    print("-------------------\n")

    # --- Email Construction ---
    try:
        msg = MIMEMultipart()
        msg['From'] = f'"{from_name}" <{from_addr}>'
        msg['To'] = to_addr
        msg['Subject'] = "SMTP Server Test"

        body = "This is a test email sent from the Python SMTP configuration tester."
        msg.attach(MIMEText(body, 'plain'))

    except Exception as e:
        print(f"❌ Error creating the email message: {e}")
        return

    # --- SMTP Connection and Sending ---
    server = None
    try:
        print("⏳ Attempting to connect to the server...")

        # Choose the correct SMTP class based on encryption
        if encryption == 'ssl':
            server = smtplib.SMTP_SSL(host, port, timeout=10)
        else:
            server = smtplib.SMTP(host, port, timeout=10)

        server.set_debuglevel(0) # Set to 1 for verbose output

        # If using TLS, start the TLS handshake
        if encryption == 'tls':
            print("⏳ Starting TLS encryption...")
            server.starttls()

        print("🔐 Logging in...")
        server.login(username, password)

        print("✉️ Sending email...")
        server.send_message(msg)

        print("\n✅ Success! The test email was sent successfully.")
        print("Please check the inbox of the recipient email address.")

    except smtplib.SMTPAuthenticationError:
        print("\n❌ Authentication Failed: The username or password you provided is incorrect.")
    except smtplib.SMTPServerDisconnected:
        print("\n❌ Server Disconnected: The server unexpectedly disconnected. This could be a network issue or a server-side problem.")
    except smtplib.SMTPConnectError as e:
        print(f"\n❌ Connection Error: Failed to connect to the server at {host}:{port}. Check the host and port.")
        print(f"   Details: {e}")
    except ConnectionRefusedError:
         print(f"\n❌ Connection Refused: The connection was refused by the server at {host}:{port}. Please check the host and port, and ensure the server is running and accessible.")
    except TimeoutError:
        print("\n❌ Connection Timeout: The connection attempt timed out. The server might be down or unreachable.")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")
        print("   Please check your SMTP settings and network connection.")

    finally:
        if server:
            try:
                server.quit()
                print("🔌 Connection closed.")
            except smtplib.SMTPServerDisconnected:
                # If the server is already disconnected, we don't need to do anything.
                pass


if __name__ == "__main__":
    # To run this script:
    # 1. Make sure you have python-dotenv installed: pip install python-dotenv
    # 2. Create a file named .env in the same directory as this script.
    # 3. Add your SMTP credentials to the .env file like this:
    #    MAIL_MAILER=smtp
    #    MAIL_HOST=your-smtp-host.com
    #    MAIL_PORT=587
    #    MAIL_USERNAME=your-username
    #    MAIL_PASSWORD=your-password
    #    MAIL_ENCRYPTION=tls
    #    MAIL_FROM_ADDRESS=sender@example.com
    #    MAIL_FROM_NAME="Your Name"
    # 4. Run the script from your terminal: python your_script_name.py

    test_smtp_server()
