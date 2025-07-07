from typing import TypedDict, Annotated, Literal
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from workflow.tools.legal_data_tool import (
    search_legal_property_law_knowledge,
    search_civil_law_knowledge,
    search_corporate_law_knowledge,
)
from app.core.config import MODELS, TEMPERATURE, OPENAI_API_KEY

import logging
logger = logging.getLogger(__name__)

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_query: str
    context: str
    response: str

class LawyerAgent:
    def __init__(self):
        self.system_prompt = (
            "You are a legal assistant specialized in property law, civil law, and corporate law.\n"
            "Your task is to assist users by providing accurate and relevant legal information based on their queries.\n"
            "You can use the following tools to search for legal knowledge:\n\n"
            "You must return a response in markdown format. since i directly render the response in a web page.\n"
            "**Tool Usage:**\n"
            "- Use `search_legal_property_law_knowledge` for search legal property law knowledge\n"
            "- Use `search_civil_law_knowledge` for searching civil law knowledge\n"
            "- Use `search_corporate_law_knowledge` for searching corporate law knowledge\n"
            "only use these tools when necessary.\n"
        )
        self.model = ChatOpenAI(
            model=MODELS[2],  # Using gpt-4o-mini
            temperature=TEMPERATURE,
            api_key=OPENAI_API_KEY
        )
        self.tools = [
            search_legal_property_law_knowledge,
            search_civil_law_knowledge,
            search_corporate_law_knowledge,
        ]
        self.llm_with_tools = self.model.bind_tools(self.tools)
        self.tool_node = ToolNode(self.tools)
        self.memory = MemorySaver()
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        def should_continue(state: AgentState) -> Literal["tools", "end"]:
            last_message = state["messages"][-1]
            if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
                return "tools"
            return "end"

        def call_model(state: AgentState) -> AgentState:
            messages = state["messages"]
            response = self.llm_with_tools.invoke(messages)
            return {"messages": [response]}

        def call_tools(state: AgentState) -> AgentState:
            last_message = state["messages"][-1]
            tool_results = self.tool_node.invoke({"messages": [last_message]})
            return {"messages": state["messages"] + tool_results["messages"]}

        workflow = StateGraph(AgentState)
        workflow.add_node("agent", call_model)
        workflow.add_node("tools", self.tool_node)
        workflow.add_edge(START, "agent")
        workflow.add_conditional_edges(
            "agent",
            should_continue,
            {
                "tools": "tools",
                "end": END
            }
        )
        workflow.add_edge("tools", "agent")

        graph = workflow.compile(checkpointer=self.memory)
        return graph

    def is_new_thread(self, thread_id: int) -> bool:
        """
        Checks if this is a new thread by querying the graph's state.
        Returns True if there is no history for this thread_id.
        """
        config = {"configurable": {"thread_id": str(thread_id)}}
        state = self.graph.get_state(config=config)
        if state.values == {}:
            return True
        else:
            return False

def chat(
    agent: LawyerAgent,
    thread_id: int,
    user_input: str
) -> str:
    try:
        # Detect if this is a new thread by checking existing state
        is_new = agent.is_new_thread(thread_id)

        messages = []
        if is_new:
            print("Starting a new thread.")
            messages.append(SystemMessage(content=agent.system_prompt))

        messages.append(HumanMessage(content=user_input))

        initial_state = {
            "messages": messages,
            "user_query": user_input,
            "context": "",
            "response": ""
        }
        config = {"configurable": {"thread_id": str(thread_id)}}
        result = agent.graph.invoke(initial_state, config)
        final_message = result["messages"][-1]
        if hasattr(final_message, 'content'):
            return final_message.content
        else:
            return str(final_message)
    except Exception as e:
        logger.error(f"Error in chat function: {e}", exc_info=True)
        return f"I encountered an error while processing your request: {str(e)}"

# Initialize agent once for reuse
agent = LawyerAgent()

class LawChatbot:
    def __init__(self, thread_id: int = 0):
        self.thread_id = thread_id

    def chat(self, user_input: str) -> str:
        return chat(agent, self.thread_id, user_input)

def kickoff_legalAgent(thread_id: int, domain: str, user_input: str):
    chatbot = LawChatbot(thread_id=thread_id)
    response = chatbot.chat(user_input)
    return response

