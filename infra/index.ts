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

const publicSubnet2 = new aws.ec2.Subnet("publicSubnet2", {
    vpcId: vpc.id,
    cidrBlock: "11.0.2.0/24",
    availabilityZone: "eu-west-1b",
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
            fromPort: 443,
            protocol: "tcp",
            toPort: 443,
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
        },

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
    instanceType: "t3.small",
    tags: {
        Name: "drops",
    },
    keyName: "citd",
    userData: fs.readFileSync("server-init.sh", "utf8"),
});

const cert = new aws.acm.Certificate("cert", {
    domainName: "robosnipers.com",
    subjectAlternativeNames: ["robosnipers.com", "www.robosnipers.com"],
    tags: {
        Name: "drops",
    },
    validationMethod: "DNS",
});

const alb = new aws.lb.LoadBalancer("drops-alb", {
    internal: false,
    loadBalancerType: "application",
    securityGroups: [securityGroup.id],
    subnets: [publicSubnet.id, publicSubnet2.id],
    enableDeletionProtection: false,
    tags: {
        Name: "drops",
    },
});

const targetGroup = new aws.lb.TargetGroup("drops-target", {
    port: 80,
    protocol: "HTTP",
    vpcId: vpc.id,
    healthCheck: {
        healthyThreshold: 2,
        unhealthyThreshold: 2,
        timeout: 3,
        path: "/elb-status",
        interval: 30,
    },
});

const targetGroupAttachment = new aws.lb.TargetGroupAttachment("drops-target-association", {
    targetGroupArn: targetGroup.arn,
    targetId: web.id,
    port: 80,
});

const secureListener = new aws.lb.Listener("https-listener", {
    loadBalancerArn: alb.id,
    protocol: "HTTPS",
    port: 443,
    sslPolicy: "ELBSecurityPolicy-2016-08",
    certificateArn: cert.arn,
    defaultActions: [
        {
            type: "forward",
            forward: {
                targetGroups: [
                    {
                        arn: targetGroup.arn
                    }
                ],
                stickiness: {
                    enabled: true,
                    duration: 604800
                }
            }
        }
    ]
})

const httpListener = new aws.lb.Listener("http-listener", {
    loadBalancerArn: alb.id,
    protocol: "HTTP",
    port: 80,
    defaultActions: [
        {
            type: "redirect",
            redirect: {
                statusCode: "HTTP_301",
                protocol: "HTTPS",
                port: "443",
                host: "robosnipers.com",
            }
        }
    ]
})


const primary = new aws.route53.Zone("drs", {
    name: "robosnipers.com"
});

const baseRecord = new aws.route53.Record("base-record", {
    zoneId: primary.id,
    name: "robosnipers.com",
    type: "A",
    aliases: [{
        name: alb.dnsName,
        zoneId: alb.zoneId,
        evaluateTargetHealth: true,
    }],
})

const wwwRecord = new aws.route53.Record("www-record", {
    zoneId: primary.id,
    name: "www",
    type: "CNAME",
    ttl: 5,
    records: [baseRecord.name],
})

// const validationRecord1 = new aws.route53.Record("validation-record1", {
//     zoneId: primary.id,
//     type: "CNAME",
//     name: "_a2fe461d49a64c73d886d8b3692bf238.robosnipers.com.",
//     ttl: 5,
//     records: [cert.domainValidationOptions[0].resourceRecordName],
// })
//
// const validationRecord2 = new aws.route53.Record("validation-record2", {
//     zoneId: primary.id,
//     type: "CNAME",
//     name: "_a4fda78699bc3c29e630f28b9353ff96.www.robosnipers.com.",
//     ttl: 5,
//     records: [cert.domainValidationOptions[1].resourceRecordName],
// })


export const publicDns = alb.dnsName;
export const instanceIp = web.publicIp;
