from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class LegalQueryBase(BaseModel):
    thread_id: int
    domain: str
    user_input: str
    lang: Optional[str] = "en"

    class Config:
        from_attributes = True

        model_config = ConfigDict(
            populate_by_name=True,
            arbitrary_types_allowed=True,
            json_schema_extra={
                "example": {
                    "thread_id": 1,
                    "domain": "property law",
                    "user_input": "What are the requirements for a valid lease agreement?",
                    "lang": "en"
                }
            },
        )

class LegalQueryOutput(BaseModel):
    answer: str
    thread_id: int
    lang: Optional[str] = "en"
    date_created: datetime = Field(default_factory=datetime.now)