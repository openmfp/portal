import { HelpContext } from '../luigiNode';

export interface ExtendedLuigiConfigFragment {
  isMissingMandatoryData?: boolean;
  extensionClassName?: string;
  helpContext?: HelpContext;
}
