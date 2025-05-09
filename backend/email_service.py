"""
Email service for sending newsletters to subscribers.
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from typing import List, Dict, Any
import logging
from jinja2 import Environment, FileSystemLoader, select_autoescape
import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        """Initialize email service with environment variables."""
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.sender_email = os.getenv("SENDER_EMAIL")
        self.website_url = os.getenv("WEBSITE_URL", "https://yourwebsite.com")
        
        # Set up Jinja2 for email templates
        self.template_env = Environment(
            loader=FileSystemLoader("templates"),
            autoescape=select_autoescape(['html', 'xml'])
        )
        
        if not all([self.smtp_username, self.smtp_password, self.sender_email]):
            logger.warning("Email configuration incomplete. Check environment variables.")
    
    def _create_html_newsletter(self, articles: List[Dict[str, Any]], subscriber: Dict[str, Any]) -> str:
        """Create HTML content for newsletter using template."""
        template = self.template_env.get_template("newsletter_template.html")
        
        # Get subscriber name (use part before @ in email if no name provided)
        name = subscriber.get("name")
        if not name:
            name = subscriber.get("email", "").split('@')[0]
        
        # Format current date
        today = datetime.datetime.now().strftime("%B %d, %Y")
        
        # Extract preview text for each article (first paragraph or limited characters)
        articles_with_preview = []
        for article in articles:
            article_copy = article.copy()
            
            if "content" in article_copy:
                # Get first paragraph or first 200 chars
                content = article_copy["content"]
                if "\n\n" in content:
                    preview = content.split("\n\n")[0]
                else:
                    preview = content[:200] + "..." if len(content) > 200 else content
                
                article_copy["preview"] = preview
            
            articles_with_preview.append(article_copy)
        
        return template.render(
            articles=articles_with_preview,
            user_name=name,
            date=today,
            website_url=self.website_url,
            subscriber_email=subscriber.get("email", "")
        )
    
    def send_newsletter(self, subscriber: Dict[str, Any], articles: List[Dict[str, Any]]) -> bool:
        """Send newsletter to a single subscriber."""
        if not all([self.smtp_username, self.smtp_password, self.sender_email]):
            logger.error("Email configuration incomplete. Cannot send newsletter.")
            return False
            
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Weekly Research Newsletter - {datetime.datetime.now().strftime('%B %d, %Y')}"
            msg["From"] = self.sender_email
            msg["To"] = subscriber["email"]
            
            # Create HTML content
            html_content = self._create_html_newsletter(articles, subscriber)
            msg.attach(MIMEText(html_content, "html"))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
                
            logger.info(f"Newsletter sent to {subscriber['email']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send newsletter to {subscriber['email']}: {str(e)}")
            return False
    
    def send_bulk_newsletter(self, subscribers: List[Dict[str, Any]], articles: List[Dict[str, Any]]) -> Dict[str, int]:
        """Send newsletter to multiple subscribers and return statistics."""
        results = {"success": 0, "failure": 0}
        
        for subscriber in subscribers:
            success = self.send_newsletter(subscriber, articles)
            if success:
                results["success"] += 1
            else:
                results["failure"] += 1
                
        return results