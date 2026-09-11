import json
import os

from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel


load_dotenv()


class ExpenseExtraction(BaseModel):
    amount: float
    category: str
    description: str | None
    payment_method: str | None
    expense_date: str | None
    source: str


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def extract_expense_from_text(text: str, current_date: str):
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",

        messages=[
            {
                "role": "system",
                "content": f"""
You are an expense extraction assistant.

Today's date is {current_date}.

Extract financial expense information from the user's sentence.

Allowed categories:
- Food
- Travel
- Accommodation
- Electricity
- Recharge
- Shopping
- Entertainment
- Healthcare
- Education
- Transport
- Other

Rules:
1. Extract the amount as a number.
2. Convert common currency expressions such as Rs, ₹, rupees into a numeric amount.
3. Choose the most appropriate category.
4. Create a short description.
5. Extract the payment method if mentioned.
6. Resolve words such as "today" and "yesterday" using today's date.
7. If a field is not mentioned, return null.
8. source must always be "voice".
9. Do not invent financial information.
""",
            },
            {
                "role": "user",
                "content": text,
            },
        ],

        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "expense_extraction",
                "strict": True,
                "schema": ExpenseExtraction.model_json_schema(),
            },
        },
    )

    result = json.loads(
        response.choices[0].message.content
    )

    return ExpenseExtraction.model_validate(result)