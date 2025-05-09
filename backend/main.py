from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_subscribers, post_article, get_articles, get_article_by_id, get_article_by_slug
from dotenv import load_dotenv
from newsletter_routes import router as newsletter_router

load_dotenv()

app = FastAPI()

app.include_router(newsletter_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

