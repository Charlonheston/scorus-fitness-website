import json
import os
import sys
from run_agent import AIAgent
from tools.mcp_tool_discovery import discover_mcp_tools

body=json.load(sys.stdin)
discover_mcp_tools(allowed_mcp_names=['scorus'])
agent=AIAgent(model=os.environ.get('HERMES_MODEL') or 'scorus-probe',api_key=os.environ.get('HERMES_MODEL_KEY') or 'private-probe',base_url=os.environ.get('HERMES_MODEL_URL') or 'http://backend:4280/not-a-model',provider='custom',enabled_toolsets=['scorus'],max_iterations=8,max_tokens=1000,quiet_mode=True,save_trajectories=False,skip_memory=True,skip_context_files=True,skip_background_review=True,load_soul_identity=False,checkpoints_enabled=False,run_budget_seconds=120)
tools=[tool['function']['name'] for tool in agent.tools]
allowed={'mcp__scorus__'+name for name in ('get_offer','get_profile','update_profile','get_slots','book_call','prepare_checkout','request_human','get_client_status')}
assert set(tools)==allowed, 'Hermes tool permissions do not match the Scorus allowlist'
if body.get('probe'):
    print('SCORUS_RESULT:'+json.dumps({'allowed_tools':tools,'memory_disabled':True}))
    sys.exit(0)
result=agent.run_conversation(user_message=body['prompt'],system_message=body['system']+'\nCONTEXTO PRIVADO DEL INTERLOCUTOR:\n'+json.dumps(body['lead_context'],ensure_ascii=False),conversation_history=body['history'])
reply=result.get('final_response','')
if not reply:raise RuntimeError('Hermes did not finish')
usage={'input_tokens':getattr(agent,'session_input_tokens',0),'output_tokens':getattr(agent,'session_output_tokens',0),'total_tokens':getattr(agent,'session_total_tokens',0),'api_calls':getattr(agent,'session_api_calls',0),'estimated_cost_usd':getattr(agent,'session_estimated_cost_usd',0),'cost_status':getattr(agent,'session_cost_status','unknown')}
print('SCORUS_RESULT:'+json.dumps({'reply':reply,'usage':usage},ensure_ascii=False))
