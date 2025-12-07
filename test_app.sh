#!/bin/bash

# Test script for the NestJS file upload application

LOG_FILE="test_output.log"
BASE_URL="http://localhost:3000"
DUMMY_FILE="test_image.jpg"

# Clean up previous log file
> "$LOG_FILE"

echo "--- Starting Application Test ---" | tee -a "$LOG_FILE"

# 1. Create a dummy file to upload
echo "Downloading dummy image file: $DUMMY_FILE" | tee -a "$LOG_FILE"
curl -s -o "$DUMMY_FILE" https://www.nasa.gov/sites/default/files/thumbnails/image/main_image_star-forming_region_carina_nircam_final-5mb.jpg
echo "---" | tee -a "$LOG_FILE"

# 2. Upload the file and extract the Job ID
echo "Uploading $DUMMY_FILE to $BASE_URL/upload" | tee -a "$LOG_FILE"
UPLOAD_RESPONSE=$(curl -s -X POST -F "file=@$DUMMY_FILE" "$BASE_URL/upload")
echo "Upload response: $UPLOAD_RESPONSE" | tee -a "$LOG_FILE"

JOB_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
    echo "!!! Test Failed: Could not extract Job ID from upload response." | tee -a "$LOG_FILE"
    rm "$DUMMY_FILE"
    exit 1
fi

echo "Extracted Job ID: $JOB_ID" | tee -a "$LOG_FILE"
echo "---" | tee -a "$LOG_FILE"

# 3. Poll for job status
STATUS_URL="$BASE_URL/upload/$JOB_ID/status"
echo "Polling for job status at: $STATUS_URL" | tee -a "$LOG_FILE"

TIMEOUT=60 # 60 seconds timeout
ELAPSED=0
JOB_STATUS=""

while [ "$JOB_STATUS" != '"completed"' ] && [ "$JOB_STATUS" != '"failed"' ]; do
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
        echo "!!! Test Failed: Timeout waiting for job to complete." | tee -a "$LOG_FILE"
        rm "$DUMMY_FILE"
        exit 1
    fi

    JOB_STATUS_RESPONSE=$(curl -s "$STATUS_URL")
    JOB_STATUS=$(echo "$JOB_STATUS_RESPONSE" | grep -o '"status":"[^""].*' | cut -d'"' -f4)
    # The above grep returns "status":"completed", so let's re-grep to get just the value.
    JOB_STATUS=$(echo "$JOB_STATUS" | grep -o '[^""].*')


    echo "Current job status: $JOB_STATUS" | tee -a "$LOG_FILE"
    
    # Add quotes back for the comparison
    JOB_STATUS=""$JOB_STATUS""

    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo "Job finished with status: $JOB_STATUS" | tee -a "$LOG_FILE"
echo "---" | tee -a "$LOG_FILE"

if [ "$JOB_STATUS" != '"completed"' ]; then
    echo "!!! Test Failed: Job did not complete successfully." | tee -a "$LOG_FILE"
    rm "$DUMMY_FILE"
    exit 1
fi

# 4. Get the job result
RESULT_URL="$BASE_URL/upload/$JOB_ID/result"
echo "Fetching job result from: $RESULT_URL" | tee -a "$LOG_FILE"
RESULT_RESPONSE=$(curl -s "$RESULT_URL")

echo "Job result response: $RESULT_RESPONSE" | tee -a "$LOG_FILE"
echo "---" | tee -a "$LOG_FILE"

# 5. Cleanup
echo "Cleaning up dummy file: $DUMMY_FILE" | tee -a "$LOG_FILE"
rm "$DUMMY_FILE"

echo "--- Test Finished ---" | tee -a "$LOG_FILE"
echo "Full output logged to $LOG_FILE"
