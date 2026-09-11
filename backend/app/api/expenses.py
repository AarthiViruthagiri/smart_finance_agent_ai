from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.database.database import get_db
from app.models.expense import Expense
from app.auth import get_current_user


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


# ==========================================
# REQUEST MODELS
# ==========================================

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str | None = None
    payment_method: str | None = None
    source: str = "manual"


class ExpenseParseRequest(BaseModel):
    text: str


# ==========================================
# ADD EXPENSE MANUALLY
# ==========================================

@router.post("/")
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user["sub"]

    expense = Expense(
        clerk_user_id=user_id,
        amount=expense_data.amount,
        category=expense_data.category,
        description=expense_data.description,
        payment_method=expense_data.payment_method,
        source=expense_data.source
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return {
        "message": "Expense added successfully",
        "expense_id": expense.id
    }


# ==========================================
# GET ALL EXPENSES
# ==========================================

@router.get("/")
def get_expenses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user["sub"]

    expenses = (
        db.query(Expense)
        .filter(
            Expense.clerk_user_id == user_id
        )
        .all()
    )

    return expenses


# ==========================================
# PARSE EXPENSE FROM TEXT
# ==========================================

@router.post("/parse")
def parse_expense(
    request: ExpenseParseRequest
):
    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Expense text cannot be empty"
        )

    text_lower = text.lower()

    # --------------------------------------
    # DEFAULT VALUES
    # --------------------------------------

    amount = None
    category = "Other"
    description = None
    payment_method = None
    expense_date = None

    # --------------------------------------
    # EXTRACT AMOUNT
    # --------------------------------------

    import re

    amount_match = re.search(
        r"(?:rs\.?|₹|inr)\s*(\d+(?:\.\d+)?)",
        text_lower
    )

    if not amount_match:
        amount_match = re.search(
            r"\b(\d+(?:\.\d+)?)\b",
            text_lower
        )

    if amount_match:
        amount = float(amount_match.group(1))

    # --------------------------------------
    # CATEGORY
    # --------------------------------------

    if any(
        word in text_lower
        for word in [
            "dinner",
            "lunch",
            "breakfast",
            "food",
            "restaurant",
            "meal",
            "pizza",
            "biriyani",
            "biryani"
        ]
    ):
        category = "Food"

    elif any(
        word in text_lower
        for word in [
            "grocery",
            "groceries",
            "supermarket"
        ]
    ):
        category = "Food"

    elif any(
        word in text_lower
        for word in [
            "uber",
            "ola",
            "auto",
            "bus",
            "train",
            "taxi",
            "transport"
        ]
    ):
        category = "Transport"

    elif any(
        word in text_lower
        for word in [
            "movie",
            "cinema",
            "entertainment"
        ]
    ):
        category = "Entertainment"

    elif any(
        word in text_lower
        for word in [
            "electricity",
            "current",
            "eb bill"
        ]
    ):
        category = "Utilities"

    elif any(
        word in text_lower
        for word in [
            "rent",
            "house rent"
        ]
    ):
        category = "Accommodation"

    # --------------------------------------
    # PAYMENT METHOD
    # --------------------------------------

    if "upi" in text_lower:
        payment_method = "UPI"

    elif "cash" in text_lower:
        payment_method = "Cash"

    elif any(
        word in text_lower
        for word in [
            "credit card",
            "credit"
        ]
    ):
        payment_method = "Credit Card"

    elif any(
        word in text_lower
        for word in [
            "debit card",
            "debit"
        ]
    ):
        payment_method = "Debit Card"

    # --------------------------------------
    # DESCRIPTION
    # --------------------------------------

    description_words = [
        "dinner",
        "lunch",
        "breakfast",
        "groceries",
        "grocery",
        "pizza",
        "biryani",
        "biriyani",
        "uber",
        "ola",
        "auto",
        "bus",
        "train",
        "taxi",
        "movie",
        "rent",
        "electricity"
    ]

    for word in description_words:
        if word in text_lower:
            description = word.capitalize()
            break

    # --------------------------------------
    # DATE
    # --------------------------------------

    if "today" in text_lower:
        expense_date = datetime.now().date().isoformat()

    elif "yesterday" in text_lower:
        from datetime import timedelta

        expense_date = (
            datetime.now().date() - timedelta(days=1)
        ).isoformat()

    # --------------------------------------
    # VALIDATE AMOUNT
    # --------------------------------------

    if amount is None:
        raise HTTPException(
            status_code=400,
            detail="Could not detect expense amount"
        )

    # --------------------------------------
    # RETURN PARSED DATA
    # --------------------------------------

    return {
        "amount": amount,
        "category": category,
        "description": description,
        "payment_method": payment_method,
        "expense_date": expense_date,
        "source": "voice"
    }