import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import {registerAutoTags} from "./autotag";


registerAutoTags({
  app: "drops",
  stack: pulumi.getStack(),
  deployed_by: "Oscar Chinellato"
})

const vpc = awsx.ec2.Vpc.getDefault();

const publicSubnet = new aws.ec2.Subnet(`${pulumi.getStack()}-public-1`, {
  vpcId: vpc.id,
  cidrBlock: "172.31.50.0/24",
  availabilityZone: "eu-west-1a",
  tags: {
    Name: "drops",
  }
})

const publicSubnet2 = new aws.ec2.Subnet(`${pulumi.getStack()}-public-2`, {
  vpcId: vpc.id,
  cidrBlock: "172.31.51.0/24",
  availabilityZone: "eu-west-1b",
  tags: {
    Name: "drops",
  }
})

aws.ec2.getInternetGateway({
  internetGatewayId: "igw-a2b63ec6",
})
  .then(gateway => {
    const routeTable = new aws.ec2.RouteTable(`${pulumi.getStack()}-rt`, {
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

    const association = new aws.ec2.RouteTableAssociation(`${pulumi.getStack()}-ts-association`, {
      subnetId: publicSubnet.id,
      routeTableId: routeTable.id,
    })

    const association2 = new aws.ec2.RouteTableAssociation(`${pulumi.getStack()}-ts-association-2`, {
      subnetId: publicSubnet2.id,
      routeTableId: routeTable.id,
    })
  })


const securityGroup = new aws.ec2.SecurityGroup(`${pulumi.getStack()}-sg`, {
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



const web = new aws.ec2.Instance(`${pulumi.getStack()}-server`, {
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

const eip = new aws.ec2.Eip(`${pulumi.getStack()}-eip`, {
  vpc: true,
  instance: web.id
})


export const elasticIp = eip.publicIp
export const instanceIp = web.publicIp;
