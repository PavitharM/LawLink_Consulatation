import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Button, Label, Sheet } from './ui';
import { colors, fonts, radius, space } from '../theme';

const pad = (n: number) => String(n).padStart(2, '0');
/** 'YYYY-MM-DD' (date) or 'YYYY-MM-DDTHH:mm' (datetime) — same formats as <input type="date|datetime-local"> */
const toValue = (d: Date, mode: 'date' | 'datetime') => {
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return mode === 'date' ? date : `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromValue = (v: string) => {
  if (!v) return new Date();
  const [date, time] = v.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

export default function DateField({
  label,
  value,
  onChange,
  mode = 'date',
  placeholder = 'Select date',
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  mode?: 'date' | 'datetime';
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState<Date>(fromValue(value));

  const display = value
    ? mode === 'date'
      ? fromValue(value).toLocaleDateString()
      : fromValue(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : placeholder;

  const openPicker = () => {
    const current = fromValue(value);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        onChange: (e, d) => {
          if (e.type !== 'set' || !d) return;
          if (mode === 'date') return onChange(toValue(d, 'date'));
          DateTimePickerAndroid.open({
            value: d,
            mode: 'time',
            onChange: (e2, t2) => {
              if (e2.type !== 'set' || !t2) return;
              const merged = new Date(d);
              merged.setHours(t2.getHours(), t2.getMinutes());
              onChange(toValue(merged, 'datetime'));
            },
          });
        },
      });
    } else {
      setTemp(current);
      setOpen(true);
    }
  };

  return (
    <View style={{ marginBottom: space.lg }}>
      {label ? <Label>{label}</Label> : null}
      <Pressable
        onPress={openPicker}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: space.lg,
          paddingVertical: 14,
        }}
      >
        <Feather name="calendar" size={16} color={colors.textDim} />
        <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: value ? colors.text : colors.textDim }}>{display}</Text>
        {value ? (
          <Pressable hitSlop={10} onPress={() => onChange('')}>
            <Feather name="x" size={14} color={colors.textDim} />
          </Pressable>
        ) : null}
      </Pressable>
      {Platform.OS === 'ios' ? (
        <Sheet
          visible={open}
          onClose={() => setOpen(false)}
          title={label || placeholder}
          footer={
            <Button
              title="Done"
              onPress={() => {
                onChange(toValue(temp, mode));
                setOpen(false);
              }}
            />
          }
        >
          <DateTimePicker
            value={temp}
            mode={mode}
            display={mode === 'date' ? 'inline' : 'spinner'}
            themeVariant="dark"
            accentColor={colors.gold}
            onChange={(_, d) => d && setTemp(d)}
          />
        </Sheet>
      ) : null}
    </View>
  );
}
