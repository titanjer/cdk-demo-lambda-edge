import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    request = event['Records'][0]['cf']['request']
    headers = request['headers']

    if 'user-agent' not in headers:
        raise RuntimeError("No User-Agent in header")

    user_agent = headers['user-agent'][0]['value']
    parts = user_agent.split('|')

    # funapp|64402301|50000f41caeee80a07970000|android|28
    if len(parts) != 5:
        raise RuntimeError("Wrong User-Agent in header")

    app_ver = int(parts[1])
    if app_ver < 64402301:
        return {
            'status': '426',
            'body': '{"msg": "please upgrade"}',
            'headers': {
                'content-type': [
                    {
                        'key': 'Content-Type',
                        'value': 'application/json',
                    }
                ]
            }
        }

    return request