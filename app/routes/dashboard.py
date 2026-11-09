
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.database.connection import get_db
from app.database.models import Review, Finding
from datetime import datetime, timedelta, timezone

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

@router.get("/analytics")
def get_dashboard_analytics(
    db: Session = Depends(get_db)
):
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    # Reviews per day
    daily_reviews = (
        db.query(
            func.date(Review.created_at).label("date"),
            func.count(Review.id).label("count")
        )
        .filter(Review.created_at >= thirty_days_ago)
        .group_by(func.date(Review.created_at))
        .order_by(func.date(Review.created_at))
        .all()
    )

    # Findings grouped by severity
    severity_counts = (
        db.query(
            Finding.severity,
            func.count(Finding.id)
        )
        .group_by(Finding.severity)
        .all()
    )

    # Most reviewed repositories
    top_repositories = (
        db.query(
            Review.owner,
            Review.repo,
            func.count(Review.id).label("review_count")
        )
        .group_by(Review.owner, Review.repo)
        .order_by(func.count(Review.id).desc())
        .limit(5)
        .all()
    )

    return {
        "daily_reviews": [
            {
                "date": str(row.date),
                "count": row.count
            }
            for row in daily_reviews
        ],
        "severity_breakdown": {
            severity: count
            for severity, count in severity_counts
        },
        "top_repositories": [
            {
                "repository": f"{owner}/{repo}",
                "review_count": count
            }
            for owner, repo, count in top_repositories
        ]
    }
