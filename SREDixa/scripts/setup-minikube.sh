#!/bin/bash
set -e

# Start Minikube
echo "Starting Minikube..."
minikube start

# Enable the metrics server
echo "Enabling metrics server..."
minikube addons enable metrics-server

# Enable the ingress controller
echo "Enabling ingress controller..."
minikube addons enable ingress

echo "Minikube setup complete!"