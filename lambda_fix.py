"""
IMPF API Handler Lambda — FIXED VERSION
========================================
This Lambda handles TWO routes:
  POST /presigned  → Generate S3 presigned upload URL
  GET  /results    → Scan DynamoDB and return processed file records

DEPLOYMENT STEPS:
  1. Go to AWS Console → Lambda → your function (impf-api-handler or media-classifier)
  2. Replace the entire code with this file
  3. Click "Deploy"
  4. Go to API Gateway → Deploy API (stage: prod)
"""

import json
import boto3
import uuid
import os
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# ── Configuration ──
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'media-factory-akanksha-2026')
TABLE_NAME = os.environ.get('TABLE_NAME', 'media-processing-results')
PRESIGN_EXPIRY = 300  # 5 minutes

# CORS headers — required for browser requests
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
}


def lambda_handler(event, context):
    """Main entry point — routes based on path + method."""
    
    # Handle CORS preflight
    http_method = event.get('httpMethod', '')
    if http_method == 'OPTIONS':
        return respond(200, {'message': 'OK'})
    
    # Determine which route was called
    path = event.get('path', '') or event.get('resource', '')
    
    print(f"[IMPF] Received: {http_method} {path}")
    
    # ── Route: POST /presigned ──
    if '/presigned' in path and http_method == 'POST':
        return handle_presigned(event)
    
    # ── Route: GET /results ──
    if '/results' in path and http_method == 'GET':
        return handle_results(event)
    
    # ── Fallback ──
    return respond(404, {'message': f'Route not found: {http_method} {path}'})


def handle_presigned(event):
    """Generate a presigned S3 upload URL."""
    try:
        body = json.loads(event.get('body', '{}'))
        file_name = body.get('fileName', 'unnamed')
        file_type = body.get('fileType', 'application/octet-stream')
        
        # Generate unique S3 key
        unique_id = str(uuid.uuid4())
        s3_key = f"uploads/{unique_id}_{file_name}"
        
        # Generate presigned PUT URL
        upload_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': s3_key,
                'ContentType': file_type
            },
            ExpiresIn=PRESIGN_EXPIRY
        )
        
        return respond(200, {
            'uploadUrl': upload_url,
            'key': s3_key,
            'bucket': BUCKET_NAME
        })
    
    except Exception as e:
        print(f"[IMPF] Presigned error: {str(e)}")
        
        return respond(500, {'message': f'Failed to generate presigned URL: {str(e)}'})


def handle_results(event):
    """Scan DynamoDB table and return all processed file records."""
    try:
        table = dynamodb.Table(TABLE_NAME)
        
        # Scan the entire table (for small datasets this is fine)
        response = table.scan()
        items = response.get('Items', [])
        
        # Handle pagination if there are many records
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
        
        # Convert any Decimal types to int/float for JSON serialization
        cleaned_items = []
        for item in items:
            cleaned = {}
            for key, value in item.items():
                if isinstance(value, bool):          # ← MUST come before is_integer (bool is subclass of int!)
                    cleaned[key] = value
                elif hasattr(value, 'is_integer'):   # Decimal type from DynamoDB
                    cleaned[key] = int(value) if value == int(value) else float(value)
                elif isinstance(value, list):
                    cleaned_list = []
                    for v in value:
                        if isinstance(v, dict):
                            # Ensure we don't stringify the whole dict, clean nested Decimals
                            cv = {
                                nk: (int(nv) if hasattr(nv, 'is_integer') and nv == int(nv) 
                                     else float(nv) if hasattr(nv, 'is_integer') 
                                     else nv) 
                                for nk, nv in v.items()
                            }
                            cleaned_list.append(cv)
                        else:
                            cleaned_list.append(str(v) if not isinstance(v, (int, float, bool)) else v)
                    cleaned[key] = cleaned_list
                else:
                    cleaned[key] = str(value) if not isinstance(value, (str, int, float, bool, type(None))) else value
            cleaned_items.append(cleaned)
        
        print(f"[IMPF] Returning {len(cleaned_items)} results from DynamoDB")
        return respond(200, cleaned_items)
    
    except Exception as e:
        print(f"[IMPF] Results error: {str(e)}")
        return respond(500, {'message': f'Failed to fetch results: {str(e)}'})


def respond(status_code, body):
    """Build API Gateway response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, default=str)
    }
