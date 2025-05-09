from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from zoneinfo import ZoneInfo
from database import get_subscribers, post_article, get_articles, get_article_by_id, get_article_by_slug
from gpt_researcher import GPTResearcher
from gpt_researcher.utils.enum import Tone
from dotenv import load_dotenv
import contextlib
from prompts import TOPIC_PROMPT
import datetime
from fastapi import FastAPI, HTTPException
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from zoneinfo import ZoneInfo
from newsletter import NewsletterService
from newsletter_routes import router as newsletter_router

load_dotenv()

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the existing job
    await init_jobs(run_weekly_research_and_upload)
    
    # Add the newsletter job to run every Friday at 10:00 AM
    scheduler.add_job(
        run_weekly_newsletter,
        trigger=CronTrigger(day_of_week="fri", hour=10, minute=0),
        id="weekly_newsletter",
        coalesce=True,
        misfire_grace_time=600,
    )
    
    scheduler.start()
    print("APScheduler started with research and newsletter jobs")
    
    try:
        yield
    finally:
        await scheduler.shutdown(wait=False)
        print("APScheduler shut down")



app = FastAPI(lifespan=lifespan)

app.include_router(newsletter_router)




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sectors = {
    "Tech": ["AI", "Blockchain", "Cybersecurity"],
    "Health": ["Telemedicine", "Wearable Tech", "Genomics"],
    "Finance": ["Fintech", "Cryptocurrency", "Investment"],
    "Energy": ["Renewable Energy", "Electric Vehicles", "Smart Grids"],
    "Consumer": ["E-commerce", "Retail Tech", "Consumer Electronics"],
    "Real-estate": ["REIT", "Smart Homes", "Real Estate Investment"],
}

async def research(date: str, sector: str):
    query = TOPIC_PROMPT.format(date=date, sector=sector, topics=", ".join(sectors[sector]))
    researcher = GPTResearcher(query=query, report_type="research_report", tone=Tone.Informative)
    research_result = await researcher.conduct_research()
    report = await researcher.write_report()

    return {
        "research_result": report,
        "topic": f"Newsletter {sector} - {date}",
        "date": date,
        "sector": sector,
    }

async def run_sector_research():
    date = datetime.datetime.now().strftime("%Y-%m-%d")
    tasks = [research(date, sector) for sector in sectors]
    results = await asyncio.gather(*tasks)
    return results

async def run_weekly_research_and_upload():
    results = await run_sector_research()

    for r in results:
        article_name = r.get("topic")
        sector = r.get("sector")
        content = r.get("research_result")
        author = "GPTResearcher‑Bot"

        post_article(
            article_name=article_name,
            sector=sector,
            author=author,
            content=content
        )

    await asyncio.sleep(0.5)

scheduler = AsyncIOScheduler(timezone=ZoneInfo("Asia/Taipei"))

async def init_jobs(job_func):
    scheduler.add_job(
        job_func,
        trigger=CronTrigger(day_of_week="fri", hour=2, minute=0),
        id="weekly_research",
        coalesce=True,
        misfire_grace_time=600,
    )








@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/get_articles")
async def api_get_articles():
    try:
        return get_articles()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_article_by_id/{article_id}")
async def api_get_article_by_id(article_id: int):
    try:
        article = get_article_by_id(article_id)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return article
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_article_by_slug/{slug}")
async def api_get_article_by_slug(slug: str):
    try:
        article = get_article_by_slug(slug)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return article
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_weekly_newsletter():
    """Weekly job to send newsletters to subscribers."""
    newsletter_service = NewsletterService()
    await newsletter_service.send_weekly_newsletters()
