import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import {registerAutoTags} from "./autotag";
import {GetInstanceResult} from "@pulumi/aws/ec2/getInstance";

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

const responseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy(`${pulumi.getStack()}-response-headers`, {
  corsConfig: {
    accessControlAllowCredentials: false,
    accessControlAllowHeaders: {
      items: ["*"],
    },
    accessControlAllowMethods: {
      items: ["GET", "POST", "HEAD", "OPTIONS"],
    },
    accessControlAllowOrigins: {
      items: ["*"],
    },
    originOverride: true
  }
})

const originId = `${process.env.SERVER_DNS}`;
const distribution = new aws.cloudfront.Distribution('server-distribution', {
  origins: [{
    domainName: originId,
    originId: originId,
    customOriginConfig: {
      httpPort: 80,
      httpsPort: 443,
      originProtocolPolicy: 'http-only',
      originSslProtocols: ['TLSv1.2']
    }
  }],
  enabled: true,
  isIpv6Enabled: false,
  defaultCacheBehavior: {
    compress: true,
    allowedMethods: [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT",
    ],
    cachedMethods: [
      "GET",
      "HEAD",
    ],
    targetOriginId: originId,
    // responseHeadersPolicyId: responseHeadersPolicy.id,
    forwardedValues: {
      headers: ["*"],
      queryString: true,
      cookies: {
        forward: "all",
      },
    },
    viewerProtocolPolicy: "redirect-to-https",
    minTtl: 0,
    defaultTtl: 0,
    maxTtl: 0,
  },
  restrictions: {
    geoRestriction: {
      restrictionType: "none",
    }
  },
  aliases: [
    "duel-server.codeinthedark.interlogica.it"
  ],
  viewerCertificate: {
    // cloudfrontDefaultCertificate: true,
    acmCertificateArn: process.env.CERTIFICATE_ARN,
    sslSupportMethod: "sni-only",
    minimumProtocolVersion: "TLSv1.2_2021",
  }
});


const bucket = new aws.s3.Bucket(`www-frontend-${pulumi.getStack()}`, {
  acl: "public-read",
  // website: {
  //   indexDocument: "index.html",
  //   errorDocument: "404.html"
  // },
  requestPayer: "BucketOwner",
  // websiteDomain: "s3-website-eu-west-1.amazonaws.com",
  // websiteEndpoint: "ems-production-application.s3-website-eu-west-1.amazonaws.com",
  corsRules: [{
    allowedHeaders: ["*"],
    allowedMethods: [
      "GET"
    ],
    allowedOrigins: ["*"],
    exposeHeaders: ["ETag"],
    maxAgeSeconds: 3000,
  }]
});

new aws.s3.BucketPolicy(`${pulumi.getStack()}-bucket-policy`, {
  bucket: bucket.id,
  policy: {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": [
          "s3:GetObject"
        ],
        "Resource": [
          pulumi.interpolate`${bucket.arn}/*`
        ]
      }
    ]
  },
})

// const originId = `${process.env.SERVER_DNS}`;
const s3OriginId = "duel.codeinthedark.interlogica.it";
const frontendDistribution = new aws.cloudfront.Distribution('frontend-distribution', {
  origins: [
    {
      domainName: bucket.bucketRegionalDomainName,
      originId: s3OriginId,
    },
    {
      domainName: originId,
      originId: originId,
      customOriginConfig: {
        httpPort: 80,
        httpsPort: 443,
        originProtocolPolicy: 'http-only',
        originSslProtocols: ['TLSv1.2']
      }
    }],
  enabled: true,
  isIpv6Enabled: false,
  priceClass: "PriceClass_100",
  defaultRootObject: "index.html",
  customErrorResponses: [
    {
      errorCode: 404,
      errorCachingMinTtl: 300,
      responseCode: 200,
      responsePagePath: "/index.html",
    }
  ],
  // orderedCacheBehaviors:  [
  //   {
  //     pathPattern: "/api/*",
  //     compress: false,
  //     allowedMethods: [
  //       "DELETE",
  //       "GET",
  //       "HEAD",
  //       "OPTIONS",
  //       "PATCH",
  //       "POST",
  //       "PUT",
  //       ],
  //     cachedMethods: [
  //       "GET",
  //       "HEAD",
  //       "OPTIONS"
  //       ],
  //     targetOriginId: originId,
  //     // responseHeadersPolicyId: responseHeadersPolicy.id,
  //     forwardedValues: {
  //       queryString: true,
  //       cookies: {
  //         forward: "all",
  //       }
  //     },
  //     viewerProtocolPolicy: "redirect-to-https",
  //     minTtl: 0,
  //     defaultTtl: 0,
  //     maxTtl: 0
  //   }
  // ],
  defaultCacheBehavior: {
    compress: true,
    viewerProtocolPolicy: "redirect-to-https",
    allowedMethods: [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT",
    ],
    cachedMethods: [
      "GET",
      "HEAD",
    ],

    targetOriginId: s3OriginId,
    forwardedValues: {
      queryString: false,
      cookies: {
        forward: "none",
      },
    },
    minTtl: 0,
    defaultTtl: 3600,
    maxTtl: 86400,
  },
  restrictions: {
    geoRestriction: {
      restrictionType: "none",
    }
  },
  aliases: [
    // "duel.codeinthedark.interlogica.it"
  ],
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
    // acmCertificateArn: process.env.CERTIFICATE_ARN,
    // sslSupportMethod: "sni-only",
    // minimumProtocolVersion: "TLSv1.2_2021"
  }
});


export const instanceIp = web.publicIp;
