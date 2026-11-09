
import logging

from app.database.connection import SessionLocal
from app.database.models import Review, Finding

logger = logging.getLogger(__name__)


def save_review(
    owner,
    repo,
    pr_number,
    pr_title,
    pr_url,
    head_sha,
    summary,
    findings,
    comments_posted,
    github_review_id,
):
    db = SessionLocal()

    try:
        review = Review(
            owner=owner,
            repo=repo,
            pr_number=pr_number,
            pr_title=pr_title,
            pr_url=pr_url,
            head_sha=head_sha,
            summary=summary,
            findings_count=len(findings),
            comments_posted=comments_posted,
            github_review_id=str(github_review_id),
            status="completed",
        )

        db.add(review)
        db.flush()

        for finding in findings:
            db.add(
                Finding(
                    review_id=review.id,
                    file_path=finding["file"],
                    line_number=finding["line"],
                    severity=finding.get("severity", "medium").lower(),
                    issue=finding.get("issue", ""),
                    suggestion=finding.get("suggestion", ""),
                )
            )

        db.commit()

        logger.info(
            "Review saved to database: %s/%s PR #%s",
            owner,
            repo,
            pr_number,
        )

        return review.id

    except Exception:
        db.rollback()
        logger.exception("Failed to save review to database")
        raise

    finally:
        db.close()
