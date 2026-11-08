import React from 'react';
import { KeyboardTypeOptions, Text, View } from 'react-native';
import { Input, Meta, SelectField } from './ui';
import DateField from './DateField';
import { space, type as t } from '../theme';

/** View/edit field used by the profile screens (same behaviour as the web `Field` helper). */
export default function EditableField({
  label,
  value,
  editing,
  draftValue,
  onChange,
  select,
  date,
  multiline,
  keyboardType,
  disabled,
}: {
  label: string;
  value?: string | number | null;
  editing: boolean;
  draftValue?: string | number | null;
  onChange?: (v: string) => void;
  select?: string[];
  date?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  disabled?: boolean;
}) {
  if (!editing || disabled) {
    return (
      <View style={{ marginBottom: space.lg }}>
        <Meta>{label}</Meta>
        <Text style={[t.body, { marginTop: 4 }]}>{value === '' || value == null ? '—' : String(value)}</Text>
      </View>
    );
  }
  const v = draftValue == null ? '' : String(draftValue);
  if (select) return <SelectField label={label} value={v} options={select} onChange={(x) => onChange?.(x)} />;
  if (date) return <DateField label={label} value={v} onChange={(x) => onChange?.(x)} />;
  return <Input label={label} value={v} onChangeText={onChange} multiline={multiline} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' || keyboardType === 'url' ? 'none' : undefined} />;
}
