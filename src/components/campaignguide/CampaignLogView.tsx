import React from 'react';

import withDimensions, { DimensionsProps } from 'components/core/withDimensions';
import { NavigationProps } from 'components/nav/types';
import CampaignGuide from 'data/scenario/CampaignGuide';
import GuidedCampaignLog from 'data/scenario/GuidedCampaignLog';
import CampaignLogComponent from './CampaignLogComponent';

export interface CampaignLogProps {
  campaignId: number;
  campaignGuide: CampaignGuide;
  campaignLog: GuidedCampaignLog;
}

type Props = CampaignLogProps & NavigationProps & DimensionsProps;

class CampaignLogView extends React.Component<Props> {
  render() {
    const {
      campaignId,
      campaignGuide,
      campaignLog,
      fontScale,
      componentId,
    } = this.props;
    return (
      <CampaignLogComponent
        componentId={componentId}
        campaignId={campaignId}
        campaignGuide={campaignGuide}
        campaignLog={campaignLog}
        fontScale={fontScale}
      />
    );
  }
}

export default withDimensions(CampaignLogView);
