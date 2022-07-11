import * as aws from "@pulumi/aws";
import * as fs from "fs";

const vpc = new aws.ec2.Vpc("vpc", {
    cidrBlock: "11.0.0.0/16",
})

const publicSubnet = new aws.ec2.Subnet("publicSubnet", {
    vpcId: vpc.id,
    cidrBlock: "11.0.1.0/24",
    availabilityZone: "eu-west-1a",
    tags: {
        Name: "drops",
    }
})

const gateway = new aws.ec2.InternetGateway("gateway", {
    vpcId: vpc.id,
    tags: {
        Name: "drops",
    }
})

const routeTable = new aws.ec2.RouteTable("routeTable", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: gateway.id,
        }
    ],
    tags: {
        Name: "drops",
    }
})

const association = new aws.ec2.RouteTableAssociation("association", {
    subnetId: publicSubnet.id,
    routeTableId: routeTable.id,
})

const securityGroup = new aws.ec2.SecurityGroup("drops-sg", {
    vpcId: vpc.id,
    description: "Drops security group",
    ingress: [
        {
            fromPort: 22,
            protocol: "tcp",
            toPort: 22,
            cidrBlocks: ["0.0.0.0/0"],
        },
        {
            fromPort: 80,
            protocol: "tcp",
            toPort: 80,
            cidrBlocks: ["0.0.0.0/0"],
        },
        {
            fromPort: 8080,
            protocol: "tcp",
            toPort: 8081,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    egress: [
        {
            fromPort: 0,
            protocol: "-1",
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        }
    ],
    tags: {
        Name: "drops",
    }
})

const web = new aws.ec2.Instance("drops-server", {
    subnetId: publicSubnet.id,
    associatePublicIpAddress: true,
    vpcSecurityGroupIds: [securityGroup.id],
    ami: "ami-0d71ea30463e0ff8d",
    instanceType: "t3.micro",
    tags: {
        Name: "drops",
    },
    keyName: "citd",
    // userData: fs.readFileSync("server-init.sh", "utf8"),
});

const elasticIp = new aws.ec2.Eip("elasticIp", {
    instance: web.id,
});

export const publicIp = elasticIp.publicIp;