from workflow.agents.cardano_agent import kickoff_cardanoAgent
from workflow.agents.legal_assistant import kickoff_legalAgent

def run_cardano_agent(thread_id: int, user_input: str):
    """Kickoff function to start the agent with a thread ID and user input.
    Args:

        thread_id (int): The ID of the thread to be processed.
        user_input (str): The input provided by the user to the agent.
    Returns:
        None
    """
    try:
        response = kickoff_cardanoAgent(thread_id, user_input)
        return response
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    

def run_legal_agent(thread_id: int, domain: str, user_input: str):
    """Kickoff function to start the legal agent with a thread ID and user input.
    Args:
        thread_id (int): The ID of the thread to be processed.
        user_input (str): The input provided by the user to the agent.
    Returns:
        None
    """
    try:
        response = kickoff_legalAgent(thread_id, domain, user_input)
        return response
    except Exception as e:
        print(f"An error occurred: {e}")
        return None