import json
import urllib.parse
import boto3
import os
from datetime import datetime
from decimal import Decimal # <--- ADDED THIS

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')

TABLE_NAME = os.environ.get('TABLE_NAME', 'media-processing-results')

def lambda_handler(event, context):
    table = dynamodb.Table(TABLE_NAME)
    
    for record in event.get('Records', []):
        bucket = record['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(record['s3']['object']['key'], encoding='utf-8')
        
        file_name = key.split('/')[-1]
        if '_' in file_name:
            file_name = file_name.split('_', 1)[-1]
            
        file_ext = file_name.split('.')[-1].lower() if '.' in file_name else ''
        
        # --- Defaults ---
        file_type = 'unknown'
        rich_labels = [] 
        moderation_details = []
        is_safe = True
        status = 'skipped'
        
        try:
            if file_ext in ['jpg', 'jpeg', 'png']:
                file_type = 'image'
                
                # 1. Moderation
                mod_res = rekognition.detect_moderation_labels(
                    Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                    MinConfidence=60
                )
                if mod_res.get('ModerationLabels'):
                    is_safe = False
                    # Use Decimal here!
                    moderation_details = [{'name': m['Name'], 'confidence': Decimal(str(round(m['Confidence'], 1)))} for m in mod_res['ModerationLabels']]
                
                # 2. Labels
                lab_res = rekognition.detect_labels(
                    Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                    MaxLabels=15
                )
                
                # Force them into dictionaries with Decimal percentages
                for l in lab_res.get('Labels', []):
                    rich_labels.append({
                        'name': str(l['Name']),
                        'confidence': Decimal(str(round(l['Confidence'], 1))) # <--- WRAPPED IN DECIMAL
                    })
                
                # 3. Keywords
                unsafe_k = ['Gun', 'Firearm', 'Weapon', 'Violence', 'Blood', 'Nudity']
                for l_obj in rich_labels:
                    if l_obj['name'] in unsafe_k:
                        is_safe = False
                        moderation_details.append({'name': f"Keyword: {l_obj['name']}", 'confidence': l_obj['confidence']})
                
                status = 'completed'
            
            elif file_ext in ['pdf', 'doc', 'csv', 'txt']:
                file_type = 'document'
                rich_labels = [{'name': 'File Processed', 'confidence': Decimal('100.0')}]
                status = 'completed'

        except Exception as e:
            print(f"Error: {str(e)}")
            rich_labels = [{'name': 'Error', 'confidence': Decimal('0.0')}]
            status = 'error'

        # --- Save to DynamoDB ---
        timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M')
        
        item = {
            'file_id': key,
            'file_name': file_name,
            'file_type': file_type,
            'labels': rich_labels,
            'moderation_details': moderation_details,
            'label_count': len(rich_labels),
            'is_safe': is_safe,
            'status': status,
            'timestamp': timestamp
        }
        
        print(f"Saving Item: {item}")
        table.put_item(Item=item)
        
    return {'statusCode': 200, 'body': 'Success'}
