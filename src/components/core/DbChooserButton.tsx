import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Navigation } from 'react-native-navigation';
import { Brackets } from 'typeorm/browser';
import { forEach, map } from 'lodash';
import { t } from 'ttag';

import NavButton from './NavButton';
import { SearchSelectProps } from '../cardlist/SearchMultiSelectView';
import COLORS from '@styles/colors';
import DatabaseContext from '@data/sqlite/DatabaseContext';
import LanguageContext from '@lib/i18n/LanguageContext';

interface Props {
  componentId: string;
  title: string;
  field: string;
  query?: Brackets;
  tabooSetId?: number;
  onChange: (selection: string[]) => void;
  selection?: string[];
  indent?: boolean;
  processValue?: (value: string) => string[];
  capitalize?: boolean;
  fixedTranslations?: {
    [key: string]: string;
  };
}
export default function DbChooserButton({ componentId, title, field, onChange, fixedTranslations, selection, indent, query, tabooSetId, processValue, capitalize }: Props) {
  const { db } = useContext(DatabaseContext);
  const { lang, listSeperator } = useContext(LanguageContext);
  const [pressed, setPressed] = useState(false);

  const onSelectionChange = useCallback((selection: string[]) => {
    if (fixedTranslations) {
      const reversed: { [key: string]: string | undefined} = {};
      forEach(fixedTranslations, (value, key) => {
        reversed[value] = key;
      });
      onChange(map(selection, item => reversed[item] || item));
    } else {
      onChange(selection);
    }
  }, [onChange, fixedTranslations]);

  const onPress = useCallback(() => {
    setPressed(true);
    db.getDistinctFields(field, query, tabooSetId, processValue).then(values => {
      /*
      // This code will export all traits in the english database.
      console.log('const localized_traits = {')
      forEach(values, value => {
        const escaped = value.replace(`'`, `\\'`);
        console.log(`  '${escaped}': c('trait').t\`${value}\`,`)
      });
      console.log('};')
      */
      const actualValues = fixedTranslations ? map(values, item => fixedTranslations[item] || item) : values;
      const actualSelection = fixedTranslations ? map(selection || [], item => fixedTranslations[item] || item) : selection;
      Navigation.push<SearchSelectProps>(componentId, {
        component: {
          name: 'SearchFilters.Chooser',
          passProps: {
            placeholder: t`Search ${title}`,
            values: fixedTranslations ? actualValues.sort((a, b) => a.localeCompare(b, lang)) : actualValues,
            onChange: onSelectionChange,
            selection: actualSelection,
            capitalize,
          },
          options: {
            topBar: {
              title: {
                text: t`Select ${title}`,
                color: COLORS.M,
              },
              backButton: {
                title: t`Back`,
                color: COLORS.M,
              },
              rightButtons: selection && selection.length > 0 ?
                [{
                  text: t`Clear`,
                  id: 'clear',
                  color: COLORS.M,
                  accessibilityLabel: t`Clear`,
                }] : [],
            },
          },
        },
      });
      setPressed(false);
    });
  }, [capitalize, db, field, componentId, title, fixedTranslations, lang, setPressed, onSelectionChange, selection, processValue, query, tabooSetId]);

  const selectedDescription = useMemo(() => {
    if (!selection || !selection.length) {
      return t`All`;
    }
    return (fixedTranslations ? map(selection, item => fixedTranslations[item] || item) : selection).join(listSeperator);
  }, [selection, fixedTranslations, listSeperator]);
  return (
    <NavButton
      text={`${title}: ${selectedDescription}`}
      onPress={onPress}
      indent={indent}
      disabled={pressed}
    />
  );
}
