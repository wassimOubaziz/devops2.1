#!/bin/bash

# Jenkins URL - replace with your Jenkins URL
JENKINS_URL="http://your-jenkins-url:8080"
# Jenkins job name - replace with your job name
JOB_NAME="your-pipeline-name"
# Jenkins API token - replace with your token
JENKINS_TOKEN="your-jenkins-token"
# Jenkins username - replace with your username
JENKINS_USER="your-username"

# Step 2: Deploy Application
echo "Step 2: Deploying Application..."
curl -X POST \
  "${JENKINS_URL}/job/${JOB_NAME}/buildWithParameters" \
  --user "${JENKINS_USER}:${JENKINS_TOKEN}" \
  --data-urlencode "SERVICE=all" \
  --data-urlencode "AWS_ACCOUNT_ID=851725608377" \
  --data-urlencode "AWS_REGION=us-east-1" \
  --data-urlencode "VERSION=latest" \
  --data-urlencode "CLUSTER_NAME=main-cluster" \
  --data-urlencode "TERRAFORM_ACTION=none"

echo "Application deployment job triggered. Check Jenkins for progress."
