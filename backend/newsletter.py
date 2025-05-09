"""
Newsletter service for sending personalized newsletters to subscribers from the finlist table.
"""
import logging
from typing import List, Dict, Any
import datetime
from database import get_articles
from database import (
    get_all_subscribers, 
    get_subscribers_by_sector,
    log_newsletter_sent
)
from email_service import EmailService

logger = logging.getLogger(__name__)

class NewsletterService:
    def __init__(self):
        """Initialize the newsletter service."""
        self.email_service = EmailService()
    
    async def send_weekly_newsletters(self):
        """
        Send weekly newsletters to all subscribers.
        This is the main function that should be scheduled to run every Friday.
        """
        logger.info("Starting weekly newsletter distribution")
        
        # Get all subscribers from finlist
        subscribers = get_all_subscribers()
        
        if not subscribers:
            logger.info("No subscribers found")
            return {"success": 0, "failure": 0, "skipped": 0}
        
        # Get the most recent articles
        all_recent_articles = get_articles()
        
        if not all_recent_articles:
            logger.info("No articles found")
            return {"success": 0, "failure": 0, "skipped": len(subscribers)}
        
        # Group articles by sector
        articles_by_sector = {}
        for article in all_recent_articles:
            sector = article.get("sector")
            if sector:
                if sector not in articles_by_sector:
                    articles_by_sector[sector] = []
                articles_by_sector[sector].append(article)
        
        results = {"success": 0, "failure": 0, "skipped": 0}
        
        # Process each subscriber
        for subscriber in subscribers:
            subscriber_email = subscriber.get("email")
            selected_sectors = subscriber.get("selected_sectors", [])
            
            # Get relevant articles based on subscriber's selected sectors
            relevant_articles = []
            if selected_sectors:
                for sector in selected_sectors:
                    if sector in articles_by_sector:
                        # Add up to 2 articles per selected sector
                        relevant_articles.extend(articles_by_sector[sector][:2])
            else:
                # If no sectors selected, include one article from each sector
                for sector, articles in articles_by_sector.items():
                    if articles:
                        relevant_articles.append(articles[0])
            
            # Limit to at most 5 articles per newsletter
            relevant_articles = relevant_articles[:5]
            
            # Skip if no relevant articles
            if not relevant_articles:
                results["skipped"] += 1
                logger.info(f"No relevant articles for subscriber {subscriber_email}")
                continue
            
            # Prepare subscriber object for email service
            subscriber_for_email = {
                "id": subscriber.get("id"),
                "email": subscriber_email,
                "name": subscriber_email.split('@')[0],  # Use part before @ as name
                "sectors": selected_sectors
            }
            
            # Send personalized newsletter
            success = self.email_service.send_newsletter(subscriber_for_email, relevant_articles)
            
            if success:
                # Log successful newsletter delivery
                try:
                    today = datetime.datetime.now().strftime("%Y-%m-%d")
                    log_newsletter_sent(subscriber.get("id"), today)
                except Exception as e:
                    logger.error(f"Failed to log newsletter for {subscriber_email}: {str(e)}")
                
                results["success"] += 1
            else:
                results["failure"] += 1
        
        logger.info(f"Weekly newsletter distribution completed: {results}")
        return results
    
    async def send_test_newsletter(self, email: str, name: str = None):
        """
        Send a test newsletter to a specific email.
        
        Args:
            email (str): Email address to send the test newsletter to
            name (str, optional): Name to use in the newsletter greeting
        
        Returns:
            bool: True if sent successfully, False otherwise
        """
        # Get most recent articles for the test
        articles = get_articles()
        
        if not articles:
            logger.warning("No articles available for test newsletter")
            return False
        
        # Limit to 5 articles
        articles = articles[:5]
        
        # Create a test subscriber object
        test_subscriber = {
            "email": email,
            "name": name if name else email.split('@')[0]  # Use provided name or part before @ as name
        }
        
        # Send test newsletter
        return self.email_service.send_newsletter(test_subscriber, articles)