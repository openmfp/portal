import { StackSearch, URL } from '@openmfp/portal-lib/service-providers/service-provider.interfaces';

export interface HelpCenterData {
  stackSearch?: StackSearch;
  issueTracker?: URL;
  feedbackTracker?: URL;
}