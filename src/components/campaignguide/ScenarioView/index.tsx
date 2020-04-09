import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { EventSubscription, Navigation } from 'react-native-navigation';
import { t } from 'ttag';

import CampaignGuideContext, { CampaignGuideContextType } from '../CampaignGuideContext';
import { ScenarioGuideContextType } from '../ScenarioGuideContext';
import StepsComponent from '../StepsComponent';
import withScenarioGuideContext, { ScenarioGuideInputProps } from '../withScenarioGuideContext';
import { iconsMap } from 'app/NavIcons';
import withDimensions, { DimensionsProps } from 'components/core/withDimensions';
import { NavigationProps } from 'components/nav/types';
import { COLORS } from 'styles/colors';

type InputProps = NavigationProps & ScenarioGuideInputProps;

type Props = InputProps & DimensionsProps & ScenarioGuideContextType;

export type ScenarioProps = ScenarioGuideInputProps;

interface State {
  undoEnabled: boolean;
}

class ScenarioView extends React.Component<Props, State> {
  static contextType = CampaignGuideContext;
  context!: CampaignGuideContextType;

  static get options() {
    return ScenarioView.dynamicOptions(false);
  }

  static dynamicOptions(undo: boolean) {
    const rightButtons = [{
      icon: iconsMap.replay,
      id: 'reset',
      color: COLORS.navButton,
    }];
    if (undo) {
      rightButtons.push({
        icon: iconsMap.undo,
        id: 'undo',
        color: COLORS.navButton,
      });
    }
    return {
      topBar: {
        rightButtons,
      },
    };
  }
  _navEventListener: EventSubscription;

  constructor(props: Props) {
    super(props);

    const undoEnabled = props.processedScenario.canUndo;
    Navigation.mergeOptions(props.componentId, ScenarioView.dynamicOptions(undoEnabled));
    this.state = {
      undoEnabled,
    };
    this._navEventListener = Navigation.events().bindComponent(this);
  }

  componentDidUpdate() {
    const {
      processedScenario: { type, canUndo },
      componentId,
    } = this.props;
    if (canUndo !== this.state.undoEnabled) {
      Navigation.mergeOptions(componentId, ScenarioView.dynamicOptions(canUndo));
      this.setState({
        undoEnabled: canUndo,
      });
    }
    if (type !== 'started' && type !== 'completed') {
      // Get out of here
      Navigation.pop(componentId);
    }
  }

  componentWillUnmount() {
    this._navEventListener.remove();
  }

  navigationButtonPressed({ buttonId }: { buttonId: string }) {
    if (buttonId === 'reset') {
      this.resetPressed();
    }
    if (buttonId === 'undo') {
      this.undoPressed();
    }
  }

  undoPressed() {
    const { scenarioId } = this.props;
    this.context.campaignState.undo(scenarioId);
  }

  resetPressed() {
    Alert.alert(
      t`Reset Scenario?`,
      t`Are you sure you want to reset this scenario?\n\nAll data you have entered will be lost.`,
      [{
        text: t`Nevermind`,
      }, {
        text: t`Reset`,
        style: 'destructive',
        onPress: () => {
          this.context.campaignState.resetScenario(this.props.scenarioId);
        },
      }]
    );
  }

  render() {
    const { componentId, fontScale, processedScenario } = this.props;
    return (
      <ScrollView>
        <StepsComponent
          componentId={componentId}
          fontScale={fontScale}
          steps={processedScenario.steps}
        />
        <View style={styles.footer} />
      </ScrollView>
    );
  }
}

export default withScenarioGuideContext<InputProps>(
  withDimensions<InputProps & ScenarioGuideContextType>(ScenarioView)
);

const styles = StyleSheet.create({
  footer: {
    marginTop: 64,
  },
});
