#!/bin/bash
set -e

# Navigate to the scripts directory
cd "$(dirname "$0")"

# Run the Minikube setup script
echo "Setting up Minikube..."
./setup-minikube.sh

# Navigate to the Pulumi project directory
cd ../infra

# Ensure dependencies are installed
echo "Installing dependencies..."
npm install

# Check if the Pulumi stack exists
echo "Checking for existing Pulumi stack..."
if pulumi stack select dev > /dev/null 2>&1; then
    echo "Destroying existing resources..."
    pulumi destroy --yes
else
    echo "No existing stack found. Initializing a new stack..."
    pulumi stack init dev
fi

# Refresh the stack to ensure state is in sync with the cluster
echo "Refreshing Pulumi stack..."
pulumi refresh --yes

# Deploy the application
echo "Running Pulumi deployment..."
pulumi up --yes

# Verify metrics after deployment
echo "Fetching metrics for deployed resources..."
kubectl top pods -n local || echo "Metrics server might not be enabled or running."

echo "Deployment complete!"