from fastapi import HTTPException, status
from workflow.kickoff import run_cardano_agent
from app.schemas import query_schema

def query(query: query_schema.QueryBase):
    response = run_cardano_agent(thread_id=query.thread_id, user_input=query.user_input)
    if response:
        return query_schema.QueryOutput(
            answer=response,
            thread_id=query.thread_id,
            lang=query.lang or "en"
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No answer found")