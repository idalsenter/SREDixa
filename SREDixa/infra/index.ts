import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as fs from "fs";
import * as path from "path";

// Define a namespace for the deployment
const ns = new k8s.core.v1.Namespace("nginx-namespace", { metadata: { name: "local" } });

// Labels used for selectors
const appLabels = { app: "nginx" };

// Load the HTML content from the src directory
const htmlContent = fs.readFileSync(path.join(__dirname, "../src/index.html"), "utf-8");

// Create a ConfigMap for the static "Hello World" page
const htmlConfigMap = new k8s.core.v1.ConfigMap("nginx-html", {
    metadata: { namespace: ns.metadata.name },
    data: {
        "index.html": htmlContent,
    },
});

// Create an NGINX Deployment with the ConfigMap mounted
const deployment = new k8s.apps.v1.Deployment("nginx-deployment", {
    metadata: { namespace: ns.metadata.name },
    spec: {
        replicas: 3,
        selector: { matchLabels: appLabels },
        template: {
            metadata: { labels: appLabels },
            spec: {
                containers: [{
                    name: "nginx",
                    image: "nginx:latest",
                    ports: [{ containerPort: 80 }],
                    volumeMounts: [{
                        name: "html-volume",
                        mountPath: "/usr/share/nginx/html/index.html",
                        subPath: "index.html",
                    }],
                }],
                volumes: [{
                    name: "html-volume",
                    configMap: {
                        name: htmlConfigMap.metadata.name,
                    },
                }],
            },
        },
    },
});

// Create a Service to expose the NGINX Deployment
const service = new k8s.core.v1.Service("nginx-service", {
    metadata: {
        namespace: ns.metadata.name,
        name: "nginx-service", // Explicitly set the service name
    },
    spec: {
        type: "ClusterIP",
        selector: appLabels,
        ports: [{
            port: 80,
            targetPort: 80,
        }],
    },
});

// Apply the Ingress YAML file
const ingress = new k8s.yaml.ConfigFile("nginx-ingress", {
    file: path.join(__dirname, "k8s/ingress.yaml"),
});

// Apply the HPA YAML file
const hpa = new k8s.yaml.ConfigFile("nginx-hpa", {
    file: path.join(__dirname, "k8s/hpa.yaml"),
});