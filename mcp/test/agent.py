import logging
from io import BytesIO
from typing import Annotated, Literal

from langchain_openai import ChatOpenAI
from PIL import Image

# from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict
from langchain_core.tools import tool
from blockfrost import BlockFrostApi, ApiUrls
from app.core.config import BLOCKFROST_PROJECT_ID

# Setup module logger
logger = logging.getLogger(__name__)

INITIAL_PROMPT = """
You are a helpfull AI assistant have capabilities to educate users about cardano blockchain.
Apart from that you are able to pull datafrom blockfrost api and give the summar of details to the user.
If user wants to know about any transaction, you can use the blockfrost api to get the details of that transaction.
"""

def pull_the_data_from_blockfrost_api(adderss: str):
    api = BlockFrostApi(
            project_id=BLOCKFROST_PROJECT_ID,
            base_url=ApiUrls.preview.value
        )
    transaction = api.address(address=adderss)
    return transaction


@tool
def get_transaction_details(tx_hash: str) -> str:
    """
    Get transaction details from Blockfrost API.
    
    Args:
        tx_hash: The transaction hash to retrieve details for.
    
    Returns:
        A string containing the transaction details or an error message.
    """
    try:
        details = pull_the_data_from_blockfrost_api(tx_hash)
        return f"Transaction details for {tx_hash}: {details}"
    except Exception as e:
        logger.error(f"Error fetching transaction details for {tx_hash}: {e}")
        return f"Failed to fetch transaction details for {tx_hash}: {str(e)}"



class State(TypedDict):
    messages: Annotated[list, add_messages]


def print_stream(stream):
    for s in stream:
        message = s["messages"][-1]
        logger.info(f"Message received: {message.content[:200]}...")
        message.pretty_print()


def run_workflow():
    logger.info("Initializing workflow")

    tools = [get_transaction_details]
    tool_node = ToolNode(tools)

    model = ChatOpenAI(model="gpt-4o-mini").bind_tools(tools)

    logger.info(f"Initialized model and loaded {len(tools)} tools")

    # Define the function that determines whether to continue or not
    def should_continue(state: State) -> Literal["tools", END]:
        messages = state["messages"]
        last_message = messages[-1]
        if last_message.tool_calls:
            return "tools"
        return END

    # Define the function that calls the model
    def call_model(state: State):
        messages = state["messages"]
        response = model.invoke(messages)
        return {"messages": [response]}

    config = {"configurable": {"thread_id": 1}}
    logger.info(f"Set configuration: {config}")

    workflow = StateGraph(State)
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", tool_node)
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue)
    workflow.add_edge("tools", "agent")

    checkpointer = MemorySaver()
    graph = workflow.compile(checkpointer=checkpointer)

    Image.open(BytesIO(graph.get_graph().draw_mermaid_png())).show()

    logger.info("Created workflow agent graph")

    logger.info("Starting conversation with initial prompt")
    inputs = {"messages": [("user", INITIAL_PROMPT)]}
    print_stream(graph.stream(inputs, config, stream_mode="values"))

    # Start chatbot
    logger.info("Entering interactive chat loop")
    while True:
        user_input = input("User: ")
        logger.info(f"Received user input: {user_input[:200]}...")
        inputs = {"messages": [("user", user_input)]}
        print_stream(graph.stream(inputs, config, stream_mode="values"))

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting the agent workflow")
    run_workflow()
    logger.info("Agent workflow completed")