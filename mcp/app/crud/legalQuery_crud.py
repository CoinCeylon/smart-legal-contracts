from fastapi import HTTPException, status
from workflow.kickoff import run_legal_agent
from app.schemas import legalQuery_schema

def query(query: legalQuery_schema.LegalQueryBase):
    response = run_legal_agent(thread_id=query.thread_id, domain=query.domain, user_input=query.user_input)
    if response:
        return legalQuery_schema.LegalQueryOutput(
            answer=response,
            thread_id=query.thread_id,
            lang=query.lang or "en"
        )
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No answer found")