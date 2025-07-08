from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class QueryBase(BaseModel):
    thread_id: int
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
                    "user_input": "What is the process for filing a patent?",
                    "lang": "en"
                }
            },
        )

class QueryOutput(BaseModel):
    answer: str
    thread_id: int
    lang: Optional[str] = "en"
    date_created: datetime = Field(default_factory=datetime.now)