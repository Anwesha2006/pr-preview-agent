
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.database.connection import get_db
from app.database.models import Review, Finding

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):

    total_reviews = db.query(func.count(Review.id)).scalar() or 0

    total_findings = db.query(func.count(Finding.id)).scalar() or 0

    high_severity = db.query(func.count(Finding.id)).filter(
        Finding.severity == "high"
    ).scalar() or 0

    medium_severity = db.query(func.count(Finding.id)).filter(
        Finding.severity == "medium"
    ).scalar() or 0

    low_severity = db.query(func.count(Finding.id)).filter(
        Finding.severity == "low"
    ).scalar() or 0

    return {
        "total_reviews": total_reviews,
        "total_findings": total_findings,
        "high_severity": high_severity,
        "medium_severity": medium_severity,
        "low_severity": low_severity
    }

@router.get("/recent-reviews")
def get_recent_reviews(
    db: Session = Depends(get_db),
    limit: int = 5
):
    reviews = (
        db.query(Review)
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": review.id,
            "repository": f"{review.owner}/{review.repo}",
            "pr_number": review.pr_number,
            "pr_title": review.pr_title,
            "pr_url": review.pr_url,
            "findings_count": review.findings_count,
            "comments_posted": review.comments_posted,
            "status": review.status,
            "created_at": review.created_at.isoformat()
        }
        for review in reviews
    ]

@router.get("/reviews/{review_id}")
def get_review_details(
    review_id: int,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(
        Review.id == review_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    return {
        "id": review.id,
        "repository": f"{review.owner}/{review.repo}",
        "pr_number": review.pr_number,
        "pr_title": review.pr_title,
        "pr_url": review.pr_url,
        "head_sha": review.head_sha,
        "summary": review.summary,
        "findings_count": review.findings_count,
        "comments_posted": review.comments_posted,
        "status": review.status,
        "created_at": review.created_at.isoformat(),
        "findings": [
            {
                "id": finding.id,
                "file_path": finding.file_path,
                "line_number": finding.line_number,
                "severity": finding.severity,
                "issue": finding.issue,
                "suggestion": finding.suggestion
            }
            for finding in review.findings
        ]
    }

@router.get("/reviews")
def get_all_reviews(
    repository: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Review)

    if repository:
        query = query.filter(
            (Review.owner + "/" + Review.repo).ilike(
                f"%{repository}%"
            )
        )

    if status:
        query = query.filter(
            Review.status.ilike(status)
        )

    reviews = query.order_by(
        Review.created_at.desc()
    ).all()

    return [
        {
            "id": review.id,
            "repository": f"{review.owner}/{review.repo}",
            "pr_number": review.pr_number,
            "pr_title": review.pr_title,
            "pr_url": review.pr_url,
            "findings_count": review.findings_count,
            "comments_posted": review.comments_posted,
            "status": review.status,
            "created_at": review.created_at.isoformat()
        }
        for review in reviews
    ]
