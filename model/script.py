from __future__ import print_function
import time
import boto3
import sys,json
transcribe = boto3.client('transcribe')
data = sys.stdin.readline()
jsonData = json.loads(data)

transcribe.start_transcription_job(
    TranscriptionJobName=jsonData["job_name"],
    Media={'MediaFileUri': jsonData["job_uri"]},
    MediaFormat='wav',
    LanguageCode='en-US',
    OutputBucketName='shadowing-s3'
)
while True:
    status = transcribe.get_transcription_job(TranscriptionJobName=jsonData["job_name"])
    if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
        transcribe.delete_transcription_job(TranscriptionJobName=jsonData["job_name"])
        print('Job was deleted successfully')
        break

print(status)