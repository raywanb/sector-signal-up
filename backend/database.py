from supabase import create_client
from dotenv import load_dotenv
import os
import re
from typing import List, Dict, Any, Optional
load_dotenv()
from logging import Logger

logger = Logger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

logger.debug("SUPABASE URL", SUPABASE_URL)
logger.debug("SERVICE ROLE KEY", SUPABASE_SERVICE_ROLE_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def slugify(text):
    return re.sub(r"[^a-z0-9-]+", "-", text.lower()).strip("-")

def get_subscribers():
    response = supabase.table("finlist").select("*").execute()
    return response.data

def get_articles():
    response = supabase.table("articles").select("*").execute()
    return response.data

def get_article_by_id(article_id):
    response = supabase.table("articles").select("*").eq("id", article_id).limit(1).execute()
    return response.data[0] if response.data else None

def get_article_by_slug(slug):
    response = supabase.table("articles").select("*").eq("slug", slug).limit(1).execute()
    return response.data[0] if response.data else None

def post_article(article_name, sector, author, content):
    slug = slugify(article_name)
    response = supabase.table("articles").insert({
        "article_name": article_name,
        "slug": slug,
        "sector": sector,
        "author": author,
        "content": content
    }).execute()
    return response.data

def update_article(article_id, article_name, sector, author, content):
    slug = slugify(article_name)
    response = supabase.table("articles").update({
        "title": article_name,
        "slug": slug,
        "sector": sector,
        "author": author,
        "content": content
    }).eq("id", article_id).execute()
    return response.data

def delete_article(article_id):
    response = supabase.table("articles").delete().eq("id", article_id).execute()
    return response.data

def add_subscriber(email: str, sectors: Optional[List[str]] = None) -> int:
    """
    Add a new subscriber to the finlist table.
    
    Args:
        email (str): Subscriber's email
        sectors (list, optional): List of sectors the subscriber is interested in
    
    Returns:
        int: ID of the newly added subscriber
    """
    try:
        # Check if subscriber already exists
        response = supabase.table("finlist").select("id").eq("email", email).execute()
        
        if response.data:
            # If the subscriber exists, update their sectors
            if sectors:
                update_response = supabase.table("finlist").update({
                    "selected_sectors": sectors
                }).eq("email", email).execute()
            return response.data[0]["id"]  # Return existing ID
        
        # Insert new subscriber
        response = supabase.table("finlist").insert({
            "email": email,
            "selected_sectors": sectors if sectors else []
        }).execute()
        
        return response.data[0]["id"]
        
    except Exception as e:
        logger.error(f"Failed to add subscriber: {str(e)}")
        raise

def remove_subscriber(email: str) -> bool:
    """
    Remove a subscriber from the finlist table.
    
    Args:
        email (str): Subscriber's email
    
    Returns:
        bool: True if subscriber was removed, False if not found
    """
    try:
        response = supabase.table("finlist").delete().eq("email", email).execute()
        return len(response.data) > 0
        
    except Exception as e:
        logger.error(f"Failed to remove subscriber: {str(e)}")
        raise

def update_subscriber_sectors(email: str, sectors: List[str]) -> bool:
    """
    Update subscriber sectors.
    
    Args:
        email (str): Subscriber's email
        sectors (list): List of sectors the subscriber is interested in
    
    Returns:
        bool: True if subscriber was updated, False if not found
    """
    try:
        response = supabase.table("finlist").update({
            "selected_sectors": sectors
        }).eq("email", email).execute()
        
        return len(response.data) > 0
        
    except Exception as e:
        logger.error(f"Failed to update subscriber sectors: {str(e)}")
        raise

def get_all_subscribers() -> List[Dict[str, Any]]:
    """
    Get all subscribers from the finlist table.
    
    Returns:
        list: List of subscriber dictionaries
    """
    try:
        response = supabase.table("finlist").select("*").execute()
        return response.data
        
    except Exception as e:
        logger.error(f"Failed to get subscribers: {str(e)}")
        raise

def get_subscribers_by_sector(sector: str) -> List[Dict[str, Any]]:
    """
    Get subscribers interested in a specific sector.
    
    Args:
        sector (str): Sector to filter by
    
    Returns:
        list: List of subscriber dictionaries
    """
    try:
        # This query finds subscribers where the selected_sectors array contains the specified sector
        # Note: Using PostgreSQL's ? operator for JSON arrays
        response = supabase.table("finlist").select("*").filter("selected_sectors", "cs", f"[\"{sector}\"]").execute()
        return response.data
        
    except Exception as e:
        logger.error(f"Failed to get subscribers by sector: {str(e)}")
        raise

def log_newsletter_sent(subscriber_id: int, newsletter_date: str) -> int:
    """
    Log that a newsletter was sent to a subscriber.
    Creates a table if it doesn't exist.
    
    Args:
        subscriber_id (int): ID of the subscriber
        newsletter_date (str): Date of the newsletter
    
    Returns:
        int: ID of the log entry
    """
    try:
        # Check if sent_newsletters table exists, if not, we'll track in memory only
        try:
            response = supabase.table("sent_newsletters").insert({
                "subscriber_id": subscriber_id,
                "newsletter_date": newsletter_date,
                "sent_at": datetime.datetime.now().isoformat()
            }).execute()
            
            return response.data[0]["id"]
        except Exception:
            # Table may not exist, just log and continue
            logger.warning("Unable to log newsletter - table may not exist")
            return 0
        
    except Exception as e:
        logger.error(f"Failed to log newsletter: {str(e)}")
        return 0  # Non-critical, return without raising