import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  Image,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, space, Tone, toneColors, type as t } from '../theme';

export type IconName = React.ComponentProps<typeof Feather>['name'];

/* ─── Brand ─────────────────────────────────────────────────── */
export const Logo = ({ size = 20, color = colors.text }: { size?: number; color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <MaterialCommunityIcons name="scale-balance" size={size + 2} color={colors.gold} />
    <Text style={{ fontFamily: fonts.medium, fontSize: size, color, letterSpacing: -0.4 }}>
      LawLink<Text style={{ color: colors.gold }}>.</Text>
    </Text>
  </View>
);

/* ─── Text helpers ──────────────────────────────────────────── */
export const T = ({
  v = 'body',
  style,
  children,
  numberOfLines,
}: {
  v?: keyof typeof t;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  numberOfLines?: number;
}) => (
  <Text style={[t[v], style]} numberOfLines={numberOfLines}>
    {children}
  </Text>
);

export const Meta = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[t.meta, { textTransform: 'uppercase' }, style]}>{children}</Text>
);

/* ─── Screen scaffolding ────────────────────────────────────── */
export const Screen = ({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  contentStyle,
  footer,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + space.md, paddingHorizontal: space.lg };
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.screen}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[pad, { paddingBottom: space.xxxl + (footer ? 0 : insets.bottom) }, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, pad, contentStyle]}>{children}</View>
        )}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>{footer}</View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
};

/** Editorial page header: small meta row, oversized light title, muted subtitle. */
export const PageHeader = ({
  eyebrow,
  index,
  title,
  subtitle,
  right,
  back,
}: {
  eyebrow?: string;
  index?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean | (() => void);
}) => {
  const router = useRouter();
  return (
    <View style={{ marginBottom: space.xl }}>
      <View style={styles.headerTop}>
        {back ? (
          <Pressable
            hitSlop={12}
            onPress={() => (typeof back === 'function' ? back() : router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={18} color={colors.text} />
          </Pressable>
        ) : (
          <Logo size={16} />
        )}
        <View style={{ alignItems: 'flex-end' }}>
          {index ? <Text style={[t.meta, { color: colors.textMuted }]}>{index}</Text> : null}
          {eyebrow ? <Text style={[t.meta, { color: colors.textMuted }]}>{eyebrow}</Text> : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.md }}>
        <Text style={[t.h1, { flex: 1 }]}>{title}</Text>
        {right}
      </View>
      {subtitle ? <Text style={[t.bodySm, { marginTop: space.sm }]}>{subtitle}</Text> : null}
    </View>
  );
};

export const SectionTitle = ({
  title,
  action,
  onAction,
  icon,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) => (
  <View style={[styles.sectionTitle, style]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
      {icon ? <Feather name={icon} size={16} color={colors.gold} /> : null}
      <Text style={t.h3}>{title}</Text>
    </View>
    {action ? (
      <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={[t.label, { color: colors.gold }]}>{action}</Text>
        <Feather name="arrow-right" size={14} color={colors.gold} />
      </Pressable>
    ) : null}
  </View>
);

/* ─── Surfaces ──────────────────────────────────────────────── */
export const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'gold' | 'white' | 'outline' | 'danger';
}) => {
  const v =
    variant === 'gold'
      ? { backgroundColor: colors.goldDim, borderColor: colors.goldBorder }
      : variant === 'white'
        ? { backgroundColor: colors.paper, borderColor: colors.whiteBorder }
        : variant === 'outline'
          ? { backgroundColor: 'transparent', borderColor: colors.border }
          : variant === 'danger'
            ? { backgroundColor: colors.dangerDim, borderColor: 'rgba(240,106,106,0.35)' }
            : { backgroundColor: colors.surface, borderColor: colors.border };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, v, pressed && styles.pressedCard, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, v, style]}>{children}</View>;
};

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: space.md }, style]} />
);

/* ─── Buttons ───────────────────────────────────────────────── */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'white' | 'success' | 'dark' | 'outlineDark';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading,
  disabled,
  small,
  style,
  accessibilityLabel,
}: {
  title: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  variant?: BtnVariant;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) => {
  const palette: Record<BtnVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.gold, fg: colors.onGold, border: colors.gold },
    white: { bg: colors.text, fg: colors.onGold, border: colors.text },
    secondary: { bg: 'transparent', fg: colors.text, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.gold, border: 'transparent' },
    danger: { bg: colors.dangerDim, fg: colors.danger, border: 'rgba(240,106,106,0.4)' },
    success: { bg: colors.successDim, fg: colors.success, border: 'rgba(127,196,138,0.4)' },
    dark: { bg: colors.onWhite, fg: colors.white, border: colors.onWhite },
    outlineDark: { bg: 'transparent', fg: colors.onWhite, border: colors.onWhite },
  };
  const p = palette[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      hitSlop={small ? 4 : 0}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSm,
        { backgroundColor: p.bg, borderColor: p.border },
        off && { opacity: loading ? 0.7 : 0.4 },
        pressed && !off && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={p.fg} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={small ? 14 : 16} color={p.fg} /> : null}
          <Text style={[styles.btnText, small && { fontSize: 13 }, { color: p.fg }]}>{title}</Text>
          {iconRight ? <Feather name={iconRight} size={small ? 14 : 16} color={p.fg} /> : null}
        </>
      )}
    </Pressable>
  );
};

export const IconButton = ({
  name,
  onPress,
  color = colors.text,
  bg = colors.surface2,
  size = 18,
  badge,
  label,
}: {
  name: IconName;
  onPress?: () => void;
  color?: string;
  bg?: string;
  size?: number;
  badge?: number;
  /** Spoken by screen readers; defaults to a readable form of the icon name. */
  label?: string;
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={6}
    accessibilityRole="button"
    accessibilityLabel={
      (label || ICON_LABELS[name] || String(name).replace(/-/g, ' ')) + (badge ? `, ${badge} new` : '')
    }
    style={({ pressed }) => [styles.iconBtn, { backgroundColor: bg }, pressed && styles.pressed]}
  >
    <Feather name={name} size={size} color={color} />
    {badge ? (
      <View style={styles.dotBadge}>
        <Text style={styles.dotBadgeText}>{badge > 9 ? '9+' : badge}</Text>
      </View>
    ) : null}
  </Pressable>
);

/** Friendly screen-reader names for icons commonly used as standalone buttons. */
const ICON_LABELS: Partial<Record<IconName, string>> = {
  plus: 'Add',
  bell: 'Notifications',
  'arrow-left': 'Back',
  'chevron-left': 'Back',
  x: 'Close',
  edit: 'Edit',
  'edit-2': 'Edit',
  'trash-2': 'Delete',
  'log-out': 'Sign out',
  settings: 'Settings',
  search: 'Search',
  send: 'Send',
  'more-horizontal': 'More options',
};

/* ─── Inputs ────────────────────────────────────────────────── */
export const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Text style={styles.label}>
    {children}
    {required ? <Text style={{ color: colors.gold }}> *</Text> : null}
  </Text>
);

export const Input = ({
  label,
  required,
  icon,
  secure,
  hint,
  error,
  style,
  containerStyle,
  right,
  ...props
}: TextInputProps & {
  label?: string;
  required?: boolean;
  icon?: IconName;
  secure?: boolean;
  hint?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  right?: React.ReactNode;
}) => {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ marginBottom: space.lg }, containerStyle]}>
      {label ? <Label required={required}>{label}</Label> : null}
      <View
        style={[
          styles.inputWrap,
          props.multiline && { alignItems: 'flex-start', minHeight: 96 },
          focus && { borderColor: colors.gold },
          !!error && { borderColor: colors.danger },
          props.editable === false && { opacity: 0.5 },
        ]}
      >
        {icon ? <Feather name={icon} size={16} color={colors.textDim} style={props.multiline ? { marginTop: 14 } : undefined} /> : null}
        <TextInput
          placeholderTextColor={colors.textDim}
          selectionColor={colors.gold}
          secureTextEntry={secure && !show}
          onFocus={(e) => {
            setFocus(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, props.multiline && { textAlignVertical: 'top', paddingTop: 12 }, style]}
          {...props}
        />
        {secure ? (
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={10}>
            <Feather name={show ? 'eye-off' : 'eye'} size={16} color={colors.textDim} />
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? <Text style={[t.bodySm, { color: colors.danger, marginTop: 6 }]}>{error}</Text> : null}
      {hint && !error ? <Text style={[t.meta, { marginTop: 6, textTransform: 'none' }]}>{hint}</Text> : null}
    </View>
  );
};

/** Tap-to-open select backed by a bottom sheet. */
export const SelectField = ({
  label,
  required,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  containerStyle,
}: {
  label?: string;
  required?: boolean;
  value: string;
  options: (string | { label: string; value: string })[];
  onChange: (v: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
}) => {
  const [open, setOpen] = useState(false);
  const opts = options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));
  const current = opts.find((o) => o.value === value);
  return (
    <View style={[{ marginBottom: space.lg }, containerStyle]}>
      {label ? <Label required={required}>{label}</Label> : null}
      <Pressable onPress={() => setOpen(true)} style={styles.inputWrap}>
        <Text style={[styles.input, { paddingVertical: 14 }, !current && { color: colors.textDim }]} numberOfLines={1}>
          {current?.label || placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textDim} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label || placeholder}>
        {opts.map((o) => (
          <Pressable
            key={o.value}
            onPress={() => {
              onChange(o.value);
              setOpen(false);
            }}
            style={({ pressed }) => [styles.optionRow, pressed && { backgroundColor: colors.surface3 }]}
          >
            <Text style={[t.body, o.value === value && { color: colors.gold }]}>{o.label}</Text>
            {o.value === value ? <Feather name="check" size={16} color={colors.gold} /> : null}
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
};

/* ─── Chips / badges ────────────────────────────────────────── */
export const Chip = ({ label, active, onPress, count }: { label: string; active?: boolean; onPress?: () => void; count?: number }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={count ? `${label}, ${count}` : label}
    accessibilityState={{ selected: !!active }}
    hitSlop={{ top: 6, bottom: 6 }}
    style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && !active && styles.pressed]}
  >
    <Text style={[styles.chipText, active && { color: colors.onGold }]}>{label}</Text>
    {count ? (
      <View style={[styles.chipCount, active && { backgroundColor: colors.onGold }]}>
        <Text style={[styles.chipCountText, active && { color: colors.gold }]}>{count}</Text>
      </View>
    ) : null}
  </Pressable>
);

export const ChipRow = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <View style={{ marginBottom: space.md }}>
    {label ? <Meta style={{ marginBottom: 6 }}>{label}</Meta> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: space.lg }}>
      {children}
    </ScrollView>
  </View>
);

export const Badge = ({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: IconName }) => {
  const c = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      {icon ? <Feather name={icon} size={11} color={c.fg} /> : null}
      <Text style={[styles.badgeText, { color: c.fg }]}>{label}</Text>
    </View>
  );
};

export const MonoTag = ({ label }: { label: string }) => (
  <View style={styles.monoTag}>
    <Text style={styles.monoTagText}>{label}</Text>
  </View>
);

/* ─── Data display ──────────────────────────────────────────── */
export const Stat = ({
  label,
  value,
  hint,
  tone,
  icon,
  onPress,
  style,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: Tone;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) => (
  <Card onPress={onPress} style={[{ flex: 1, minWidth: '45%', padding: space.lg }, style]}>
    {icon ? (
      <View style={[styles.statIcon, { backgroundColor: tone ? toneColors[tone].bg : colors.goldDim }]}>
        <Feather name={icon} size={16} color={tone ? toneColors[tone].fg : colors.gold} />
      </View>
    ) : null}
    <Text style={[t.meta, { textTransform: 'uppercase' }]}>{label}</Text>
    <Text style={[styles.statValue, tone && !icon ? { color: toneColors[tone].fg } : null]}>{value}</Text>
    {hint ? <Text style={[t.bodySm, { fontSize: 12 }]}>{hint}</Text> : null}
  </Card>
);

export const StatGrid = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginBottom: space.xl }}>{children}</View>
);

export const InfoRow = ({ label, value, last }: { label: string; value?: React.ReactNode; last?: boolean }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={[t.bodySm, { flexShrink: 0 }]}>{label}</Text>
    {typeof value === 'string' || typeof value === 'number' || value == null ? (
      <Text style={[t.label, { flex: 1, textAlign: 'right' }]}>{value ?? '—'}</Text>
    ) : (
      value
    )}
  </View>
);

export const InfoGrid = ({ items }: { items: { label: string; value?: string | number | null }[] }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: space.lg }}>
    {items.map((it, i) => (
      <View key={i} style={{ width: '50%', paddingRight: space.md }}>
        <Meta>{it.label}</Meta>
        <Text style={[t.label, { marginTop: 4 }]}>{it.value || '—'}</Text>
      </View>
    ))}
  </View>
);

export const Avatar = ({ name, uri, size = 44, gold }: { name?: string; uri?: string | null; size?: number; gold?: boolean }) => {
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface3 }} />;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: gold ? colors.gold : colors.surface3,
        borderWidth: gold ? 0 : 1,
        borderColor: colors.goldBorder,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.medium, fontSize: size * 0.38, color: gold ? colors.onGold : colors.goldLight }}>
        {name ? name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
      </Text>
    </View>
  );
};

/* ─── Feedback ──────────────────────────────────────────────── */
/** Shared pulse so every skeleton block on screen breathes in sync. */
const usePulse = () => {
  const [v] = useState(() => new Animated.Value(0.45));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return v;
};

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  r?: number;
  style?: StyleProp<ViewStyle>;
};

/** Block driven by a pulse owned by the parent (keeps many blocks in sync with one loop). */
const SkeletonBlock = ({ width = '100%', height = 14, r = radius.sm, style, opacity }: SkeletonProps & { opacity: Animated.Value }) => (
  <Animated.View style={[{ width, height, borderRadius: r, backgroundColor: colors.surface3, opacity }, style]} />
);

/** Standalone pulsing placeholder. */
export const Skeleton = (props: SkeletonProps) => <SkeletonBlock {...props} opacity={usePulse()} />;

/**
 * Full-screen loading placeholder shaped like a typical page
 * (header, stat tiles, list cards) so content doesn't jump in.
 */
export const Loader = ({ rows = 3 }: { rows?: number }) => {
  const insets = useSafeAreaInsets();
  const o = usePulse();
  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + space.md, paddingHorizontal: space.lg }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <SkeletonBlock opacity={o} width={90} height={10} style={{ marginBottom: space.md }} />
      <SkeletonBlock opacity={o} width="70%" height={30} r={radius.sm} style={{ marginBottom: space.sm }} />
      <SkeletonBlock opacity={o} width="55%" height={12} style={{ marginBottom: space.xl }} />
      <View style={{ flexDirection: 'row', gap: space.md, marginBottom: space.xl }}>
        <SkeletonBlock opacity={o} width="48%" height={78} r={radius.lg} style={{ flex: 1 }} />
        <SkeletonBlock opacity={o} width="48%" height={78} r={radius.lg} style={{ flex: 1 }} />
      </View>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: space.md }]}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: space.md }}>
            <SkeletonBlock opacity={o} width={64} height={18} r={radius.pill} />
            <SkeletonBlock opacity={o} width={80} height={18} r={radius.pill} />
          </View>
          <SkeletonBlock opacity={o} width="80%" height={16} style={{ marginBottom: space.sm }} />
          <SkeletonBlock opacity={o} width="50%" height={12} />
        </View>
      ))}
    </View>
  );
};

/** Inline spinner for sections that load inside an already-rendered screen. */
export const InlineLoader = () => (
  <View style={{ paddingVertical: space.xl, alignItems: 'center' }}>
    <ActivityIndicator color={colors.gold} />
  </View>
);

export const Empty = ({
  icon = 'inbox',
  title,
  subtitle,
  children,
  action,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Optional primary call-to-action rendered under the copy. */
  action?: { label: string; onPress: () => void; icon?: IconName };
}) => (
  <View style={styles.empty}>
    <View style={styles.emptyHalo}>
      <View style={styles.emptyIcon}>
        <Feather name={icon} size={24} color={colors.gold} />
      </View>
    </View>
    <Text style={[t.h3, { marginTop: space.lg, textAlign: 'center' }]}>{title}</Text>
    {subtitle ? <Text style={[t.bodySm, { textAlign: 'center', marginTop: 6, maxWidth: 280 }]}>{subtitle}</Text> : null}
    {action ? (
      <Button title={action.label} icon={action.icon} small onPress={action.onPress} style={{ marginTop: space.lg, paddingHorizontal: space.xl }} />
    ) : null}
    {children}
  </View>
);

export const Banner = ({ text, tone = 'success', icon }: { text: string; tone?: Tone; icon?: IconName }) => {
  const c = toneColors[tone];
  return (
    <View style={[styles.banner, { backgroundColor: c.bg, borderColor: c.fg + '55' }]}>
      <Feather name={icon || (tone === 'danger' ? 'alert-circle' : 'check-circle')} size={16} color={c.fg} />
      <Text style={[t.label, { color: c.fg, flex: 1 }]}>{text}</Text>
    </View>
  );
};

/* ─── Modals ────────────────────────────────────────────────── */
export const Sheet = ({
  visible,
  onClose,
  title,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.grabber} />
          {title ? (
            <View style={styles.sheetHeader}>
              <Text style={[t.h2, { flex: 1 }]}>{title}</Text>
              <IconButton name="x" onPress={onClose} />
            </View>
          ) : null}
          <ScrollView style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: space.md }}>
            {children}
          </ScrollView>
          {footer ? <View style={{ paddingTop: space.md }}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const ButtonRow = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', gap: space.md }}>{children}</View>
);

/* ─── Misc ──────────────────────────────────────────────────── */
export const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <Pressable
    onPress={() => onChange(!value)}
    hitSlop={8}
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    style={[styles.toggle, value && { backgroundColor: colors.gold }]}
  >
    <View style={[styles.toggleKnob, value && { transform: [{ translateX: 18 }], backgroundColor: colors.onGold }]} />
  </Pressable>
);

export const ToggleRow = ({ label, desc, value, onChange, badge }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void; badge?: string }) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1, paddingRight: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Text style={t.label}>{label}</Text>
        {badge ? <Badge label={badge} tone="danger" /> : null}
      </View>
      {desc ? <Text style={[t.bodySm, { marginTop: 2 }]}>{desc}</Text> : null}
    </View>
    <Toggle value={value} onChange={onChange} />
  </View>
);

export const Checkbox = ({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) => (
  <Pressable
    onPress={() => onChange(!checked)}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start', marginBottom: space.lg }}
  >
    <View style={[styles.checkbox, checked && { backgroundColor: colors.gold, borderColor: colors.gold }]}>
      {checked ? <Feather name="check" size={12} color={colors.onGold} /> : null}
    </View>
    <View style={{ flex: 1 }}>{children}</View>
  </Pressable>
);

export const ProgressBar = ({ pct, color = colors.gold }: { pct: number; color?: string }) => (
  <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface3, overflow: 'hidden' }}>
    <View style={{ height: 6, width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color, borderRadius: 3 }} />
  </View>
);

export const StrengthMeter = ({ pwd, thresholds = 'profile' }: { pwd: string; thresholds?: 'profile' | 'reset' }) => {
  if (!pwd) return null;
  // Same rules as the web pages
  const n = pwd.length;
  const label = thresholds === 'reset' ? (n < 7 ? 'Weak' : n < 10 ? 'Fair' : 'Strong') : n < 6 ? 'Weak' : n < 10 ? 'Fair' : 'Strong';
  const color = label === 'Weak' ? colors.danger : label === 'Fair' ? colors.warning : colors.success;
  return (
    <View style={{ marginBottom: space.lg }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => {
          const on = thresholds === 'reset' ? n >= (i + 1) * 3 : n > i * 2;
          return <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: on ? color : colors.surface3 }} />;
        })}
      </View>
      <Text style={[t.meta, { color, marginTop: 6, textTransform: 'none' }]}>
        {label}
        {thresholds === 'profile' ? ' password' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.bg },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.xxl },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: space.lg },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: space.xl,
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  btnSm: { paddingHorizontal: space.lg, paddingVertical: 9 },
  btnText: { fontFamily: fonts.semibold, fontSize: 15, letterSpacing: -0.1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  pressedCard: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dotBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBadgeText: { fontFamily: fonts.bold, fontSize: 9, color: colors.onGold },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, paddingVertical: 13 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  chipCount: { backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 5, minWidth: 16, alignItems: 'center' },
  chipCountText: { fontFamily: fonts.bold, fontSize: 10, color: colors.onGold },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.2 },
  monoTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start' },
  monoTagText: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 11, color: colors.textMuted },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  statValue: { fontFamily: fonts.light, fontSize: 30, letterSpacing: -0.8, color: colors.text, marginTop: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  empty: { alignItems: 'center', paddingVertical: space.xxxl, paddingHorizontal: space.xl },
  emptyHalo: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.goldDim, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.md, borderRadius: radius.md, borderWidth: 1, marginBottom: space.lg },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay },
  sheet: {
    marginTop: 'auto',
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: space.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.surface3, padding: 3, justifyContent: 'center' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
});
