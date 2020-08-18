import React from 'react';
import { Alert, InteractionManager } from 'react-native';
import { findIndex, map } from 'lodash';
import { bindActionCreators, Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { t } from 'ttag';

import SinglePickerComponent from '@components/core/SinglePickerComponent';
import { fetchCards } from '@components/card/actions';
import Database from '@data/Database';
import DatabaseContext, { DatabaseContextType } from '@data/DatabaseContext';
import { AppState } from '@reducers';
import COLORS from '@styles/colors';

interface ReduxProps {
  lang: string;
  cardsLoading?: boolean;
  cardsError?: string;
}

interface ReduxActionProps {
  fetchCards: (db: Database, lang: string) => void;
}

type Props = ReduxProps & ReduxActionProps;

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Italiano', value: 'it' },
  { label: 'Français', value: 'fr' },
  { label: '한국어', value: 'ko' },
  { label: 'Українська', value: 'uk' },
  { label: 'Polski', value: 'pl' },
//  { label: 'Ру́сский', value: 'ru' },
];

class LanguagePicker extends React.Component<Props> {
  static contextType = DatabaseContext;
  context!: DatabaseContextType;

  _onLanguageChange = (index: number) => {
    const newLang = LANGUAGES[index].value;
    const {
      lang,
      fetchCards,
    } = this.props;
    if (newLang && newLang !== lang) {
      setTimeout(() => {
        Alert.alert(
          t`Confirm`,
          t`Changing app language requires downloading the translated card information from ArkhamDB. This requires network and can take some time.`,
          [
            {
              text: t`Download now`,
              onPress: () => {
                fetchCards(this.context.db, newLang);
              },
            },
            {
              text: t`Cancel`,
              style: 'cancel',
            },
          ]
        );
      }, 200);
    }
  };

  render() {
    const {
      cardsLoading,
      lang,
    } = this.props;
    return (
      <SinglePickerComponent
        title={t`Card Language`}
        description={t`Note: not all cards have translations available.`}
        onChoiceChange={this._onLanguageChange}
        selectedIndex={findIndex(LANGUAGES, x => x.value === lang)}
        choices={map(LANGUAGES, lang => {
          return {
            text: lang.label,
          };
        })}
        colors={{
          modalColor: COLORS.lightBlue,
          modalTextColor: '#FFF',
          backgroundColor: COLORS.background,
          textColor: COLORS.darkText,
        }}
        editable={!cardsLoading}
        settingsStyle
        noBorder
        hideWidget
      />
    );
  }
}

function mapStateToProps(state: AppState): ReduxProps {
  return {
    cardsLoading: state.cards.loading,
    cardsError: state.cards.error || undefined,
    lang: state.packs.lang || 'en',
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>): ReduxActionProps {
  return bindActionCreators({
    fetchCards,
  }, dispatch);
}

export default connect<ReduxProps, ReduxActionProps, unknown, AppState>(
  mapStateToProps,
  mapDispatchToProps
)(LanguagePicker);
