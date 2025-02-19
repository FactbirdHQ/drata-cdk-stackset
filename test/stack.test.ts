import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StackSet, StackSetTarget, StackSetTemplate } from 'cdk-stacksets';

import { DrataStackSet } from '#@/stack-set.js';

test('produces an identical role to the official template', () => {
  const app = new App();
  const stack = new Stack(app);

  const drataStackSet = new DrataStackSet(stack, 'DrataStack');

  new StackSet(stack, 'StackSet', {
    target: StackSetTarget.fromAccounts({
      regions: ['eu-west-1'],
      accounts: ['11111111111'],
      parameterOverrides: {
        RoleSTSExternalID: '1234567890',
      },
    }),
    template: StackSetTemplate.fromStackSetStack(drataStackSet),
  });

  Template.fromStack(stack).hasResourceProperties('AWS::CloudFormation::StackSet', {
    ManagedExecution: { Active: true },
    PermissionModel: 'SELF_MANAGED',
    TemplateURL: {
      'Fn::Sub':
        'https://s3.${AWS::Region}.${AWS::URLSuffix}/cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}/cee6cbce79cea76ab7d8819c7fcd5c9de372012e77f2525ceffc58f3c341de9e.json',
    },
    StackInstancesGroup: [
      {
        Regions: ['eu-west-1'],
        DeploymentTargets: {
          Accounts: ['11111111111'],
        },
      },
    ],
  });

  const templateStack = Template.fromJSON(
    // @ts-ignore - _toCloudFormation is not publicly exposed - call it anyway!
    drataStackSet._toCloudFormation(),
  );

  templateStack.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Condition: {
            StringEquals: {
              'sts:ExternalId': {
                Ref: 'externalId',
              },
            },
          },
          Effect: 'Allow',
          Principal: {
            AWS: {
              'Fn::Join': [
                '',
                [
                  'arn:',
                  {
                    Ref: 'AWS::Partition',
                  },
                  ':iam::',
                  {
                    Ref: 'drataAWSAccountId',
                  },
                  ':root',
                ],
              ],
            },
          },
        },
      ],
      Version: '2012-10-17',
    },
    Description: 'Cross-account read-only access for Drata Autopilot',
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/SecurityAudit',
          ],
        ],
      },
    ],
    MaxSessionDuration: 43200,
    RoleName: 'DrataAutopilotRole',
  });
});
