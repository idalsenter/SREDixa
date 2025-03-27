import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

describe("NGINX Deployment Tests", () => {
    const stack = new pulumi.StackReference("dev"); // Reference the Pulumi stack

    test("Namespace should exist", async () => {
        const namespace = stack.getOutput("namespaceName");
        const kubeConfig = pulumi.runtime.getStackOutput("kubeConfig");
        const client = new k8s.Provider("kube", { kubeconfig: kubeConfig });

        const ns = await k8s.core.v1.Namespace.get(namespace);
    });
});