
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    owner = Column(String(255), nullable=False)
    repo = Column(String(255), nullable=False)

    pr_number = Column(Integer, nullable=False)
    pr_title = Column(String(500), nullable=True)
    pr_url = Column(Text, nullable=True)

    head_sha = Column(String(100), nullable=True)

    summary = Column(Text, nullable=True)

    findings_count = Column(Integer, default=0)
    comments_posted = Column(Integer, default=0)

    github_review_id = Column(String(100), nullable=True)

    status = Column(String(50), default="completed")

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    findings = relationship(
        "Finding",
        back_populates="review",
        cascade="all, delete-orphan",
    )


class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)

    review_id = Column(
        Integer,
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )

    file_path = Column(String(500), nullable=False)
    line_number = Column(Integer, nullable=True)

    severity = Column(String(50), default="medium")

    issue = Column(Text, nullable=False)
    suggestion = Column(Text, nullable=True)

    github_comment_id = Column(String(100), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    review = relationship(
        "Review",
        back_populates="findings",
    )
