"""
API routes for newsletter operations.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Response, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from newsletter import NewsletterService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/newsletters", tags=["newsletters"])
newsletter_service = NewsletterService()

class TestEmailRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None

@router.post("/send-test")
async def send_test_newsletter(request: TestEmailRequest, background_tasks: BackgroundTasks):
    """Send a test newsletter to the specified email."""
    try:
        background_tasks.add_task(newsletter_service.send_test_newsletter, request.email, request.name)
        return {"message": f"Test newsletter queued for delivery to {request.email}"}
    except Exception as e:
        logger.error(f"Failed to send test newsletter: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-weekly")
async def trigger_weekly_newsletter(background_tasks: BackgroundTasks):
    """Manually trigger sending of weekly newsletters to all subscribers."""
    try:
        background_tasks.add_task(newsletter_service.send_weekly_newsletters)
        return {"message": "Weekly newsletter distribution started"}
    except Exception as e:
        logger.error(f"Failed to trigger weekly newsletters: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))