import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StackSet, StackSetTarget, StackSetTemplate } from 'cdk-stacksets';

import { DrataStackSet } from '#@/stack-set';

test('default', () => {
  const app = new App();
  const stack = new Stack(app);

  const drataStackSet = new DrataStackSet(stack, 'drata', {
    drata: {
      externalId: '1234567890',
    },
  });

  new StackSet(stack, 'StackSet', {
    target: StackSetTarget.fromAccounts({
      regions: ['us-east-1'],
      accounts: ['11111111111'],
      parameterOverrides: {
        Param1: 'Value1',
      },
    }),
    template: StackSetTemplate.fromStackSetStack(drataStackSet),
  });

  Template.fromStack(stack).hasResourceProperties('AWS::CloudFormation::StackSet', {
    ManagedExecution: { Active: true },
    PermissionModel: 'SELF_MANAGED',
    TemplateURL: {
      'Fn::Sub':
        'https://s3.${AWS::Region}.${AWS::URLSuffix}/cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}/44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a.json',
    },
    StackInstancesGroup: [
      {
        Regions: ['us-east-1'],
        DeploymentTargets: {
          Accounts: ['11111111111'],
        },
      },
    ],
  });
});
