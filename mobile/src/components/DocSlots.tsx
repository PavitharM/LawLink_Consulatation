import React, { useCallback, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, space, type as t } from '../theme';
import { fmtSize } from '../utils/format';
import { IconButton, IconName } from './ui';

export type DocSlot = {
  id: string;
  label: string;
  desc: string;
  required: boolean;
  multi: boolean;
  /** MIME types for the system picker */
  types: string[];
  hint: string;
};

export type FileWrap = {
  id: string;
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  tooLarge: boolean;
  isImage: boolean;
};

export type Uploads = Record<string, FileWrap[]>;

const MB = 1024 * 1024;
const MAX_SINGLE = 10 * MB;
const MAX_MULTI = 25 * MB;

const PDF = 'application/pdf';
const IMG = ['image/jpeg', 'image/png'];
const DOC = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const VIDEO = ['video/mp4', 'video/quicktime'];
const ZIP = ['application/zip', 'application/x-zip-compressed'];

export const TYPES = { PDF, IMG, DOC, VIDEO, ZIP };

/** Same slots, rules and size limits as SubmitComplaint.jsx */
export const COMPLAINT_SLOTS: DocSlot[] = [
  { id: 'id_proof', label: 'Government ID Proof', required: true, multi: false, types: [PDF, ...IMG], hint: 'PDF, JPG, PNG · max 10 MB', desc: 'NIC, Passport, or Driving License' },
  { id: 'complaint_doc', label: 'Complaint / FIR Document', required: true, multi: false, types: [PDF, ...DOC], hint: 'PDF, DOC, DOCX · max 10 MB', desc: 'Written complaint or FIR copy' },
  { id: 'evidence', label: 'Supporting Evidence', required: false, multi: true, types: [PDF, ...IMG, 'video/mp4', ...ZIP, ...DOC], hint: 'PDF, JPG, PNG, MP4, ZIP · max 25 MB', desc: 'Photos, screenshots, videos (multiple allowed)' },
  { id: 'agreement', label: 'Agreement / Contract', required: false, multi: false, types: [PDF, ...DOC], hint: 'PDF, DOC, DOCX · max 10 MB', desc: 'Sale deed, rental or employment contract' },
  { id: 'court_orders', label: 'Previous Court Orders / Notices', required: false, multi: true, types: [PDF, ...IMG], hint: 'PDF, JPG, PNG · max 10 MB', desc: 'Earlier judgements or legal notices' },
];

/** Same slots as UploadDocuments.jsx */
export const UPLOAD_SLOTS: DocSlot[] = [
  { id: 'id_proof', label: 'Government ID Proof', desc: 'NIC, Passport, or Driving License', required: true, multi: false, types: [PDF, ...IMG], hint: 'PDF, JPG, PNG · max 10 MB' },
  { id: 'complaint_doc', label: 'Complaint / FIR Document', desc: 'Written complaint, FIR copy, or official incident report', required: true, multi: false, types: [PDF, ...DOC], hint: 'PDF, DOC, DOCX · max 10 MB' },
  { id: 'evidence', label: 'Supporting Evidence', desc: 'Photos, screenshots, videos, or any documents supporting your case — upload as many files as needed', required: false, multi: true, types: [PDF, ...IMG, ...VIDEO, ...ZIP, ...DOC], hint: 'PDF, JPG, PNG, MP4, ZIP, DOC · max 25 MB each' },
  { id: 'agreement', label: 'Agreement / Contract', desc: 'Sale deed, rental agreement, employment contract, loan document, etc.', required: false, multi: false, types: [PDF, ...DOC], hint: 'PDF, DOC, DOCX · max 10 MB' },
  { id: 'court_orders', label: 'Previous Court Orders / Legal Notices', desc: 'Earlier judgements, notices, summons, or any prior legal orders related to this matter', required: false, multi: true, types: [PDF, ...IMG], hint: 'PDF, JPG, PNG · max 10 MB each' },
  { id: 'witness', label: 'Witness Statements', desc: 'Signed statements or affidavits from witnesses (if available)', required: false, multi: true, types: [PDF, ...IMG, ...DOC], hint: 'PDF, JPG, PNG, DOC, DOCX · max 10 MB each' },
];

const fileIcon = (mime: string): IconName => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'film';
  if (mime.includes('zip')) return 'archive';
  return 'file-text';
};

/** State + derived stats, shared by both upload screens. */
export function useDocUploads(slots: DocSlot[]) {
  const [uploads, setUploads] = useState<Uploads>({});

  const pick = useCallback(async (slot: DocSlot) => {
    const res = await DocumentPicker.getDocumentAsync({ type: slot.types, multiple: slot.multi, copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const wrapped: FileWrap[] = res.assets.map((a) => {
      const mime = a.mimeType || 'application/octet-stream';
      const size = a.size || 0;
      return {
        id: `${a.name}-${size}-${Date.now()}-${Math.random()}`,
        uri: a.uri,
        name: a.name,
        size,
        mimeType: mime,
        tooLarge: size > (slot.multi ? MAX_MULTI : MAX_SINGLE),
        isImage: mime.startsWith('image/'),
      };
    });
    setUploads((prev) => {
      const existing = prev[slot.id] || [];
      return { ...prev, [slot.id]: slot.multi ? [...existing, ...wrapped] : [wrapped[0]] };
    });
  }, []);

  const remove = useCallback((slotId: string, fileId: string) => {
    setUploads((prev) => {
      const remaining = (prev[slotId] || []).filter((f) => f.id !== fileId);
      if (!remaining.length) {
        const n = { ...prev };
        delete n[slotId];
        return n;
      }
      return { ...prev, [slotId]: remaining };
    });
  }, []);

  const all = Object.values(uploads).flat();
  const valid = all.filter((f) => !f.tooLarge);
  const hasOversized = all.some((f) => f.tooLarge);
  const requiredSlots = slots.filter((s) => s.required);
  const requiredDone = requiredSlots.filter((s) => (uploads[s.id] || []).some((f) => !f.tooLarge)).length;
  const complete = requiredDone === requiredSlots.length && !hasOversized;
  const optionalFilled = slots.filter((s) => !s.required && (uploads[s.id] || []).length > 0).length;

  return { uploads, pick, remove, valid, hasOversized, requiredSlots, requiredDone, complete, optionalFilled };
}

export function DocSlotList({
  slots,
  uploads,
  onPick,
  onRemove,
}: {
  slots: DocSlot[];
  uploads: Uploads;
  onPick: (s: DocSlot) => void;
  onRemove: (slotId: string, fileId: string) => void;
}) {
  const [preview, setPreview] = useState<FileWrap | null>(null);
  return (
    <View style={{ gap: space.md }}>
      {slots.map((slot) => {
        const files = uploads[slot.id] || [];
        const has = files.length > 0;
        const anyValid = files.some((f) => !f.tooLarge);
        const border = has ? (anyValid ? (slot.required ? colors.success : colors.goldBorder) : colors.danger) : colors.border;
        return (
          <View key={slot.id} style={[styles.slot, { borderColor: border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Text style={t.label}>
                  {slot.label}
                  {slot.required ? <Text style={{ color: colors.gold }}> *</Text> : <Text style={{ color: colors.textDim, fontFamily: fonts.regular }}> (Optional)</Text>}
                </Text>
                <Text style={[t.bodySm, { marginTop: 2 }]}>{slot.desc}</Text>
              </View>
              {has && anyValid ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="check-circle" size={13} color={colors.success} />
                  <Text style={[t.meta, { color: colors.success }]}>
                    {files.filter((f) => !f.tooLarge).length} file{files.length > 1 ? 's' : ''}
                  </Text>
                </View>
              ) : null}
            </View>

            {has ? (
              <View style={{ gap: 6, marginTop: space.md }}>
                {files.map((f) => (
                  <View key={f.id} style={[styles.fileRow, f.tooLarge && { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}>
                    <Feather name={fileIcon(f.mimeType)} size={16} color={f.tooLarge ? colors.danger : colors.gold} />
                    <View style={{ flex: 1 }}>
                      <Text style={t.label} numberOfLines={1}>
                        {f.name}
                      </Text>
                      <Text style={[t.meta, { textTransform: 'none' }, f.tooLarge && { color: colors.danger }]}>
                        {fmtSize(f.size)}
                        {f.tooLarge ? ' — too large' : ''}
                      </Text>
                    </View>
                    {f.isImage && !f.tooLarge ? <IconButton name="eye" size={14} onPress={() => setPreview(f)} /> : null}
                    <IconButton name="trash-2" size={14} color={colors.danger} onPress={() => onRemove(slot.id, f.id)} />
                  </View>
                ))}
              </View>
            ) : null}

            {!has || slot.multi ? (
              <Pressable onPress={() => onPick(slot)} style={({ pressed }) => [styles.drop, pressed && { borderColor: colors.gold, backgroundColor: colors.goldDim }]}>
                <Feather name="upload" size={20} color={colors.gold} />
                <Text style={[t.label, { marginTop: 6 }]}>
                  Tap to <Text style={{ color: colors.gold }}>browse</Text>
                </Text>
                <Text style={[t.meta, { textTransform: 'none', marginTop: 2 }]}>{slot.hint}</Text>
                {slot.multi ? <Text style={[t.meta, { color: colors.gold, textTransform: 'none', marginTop: 2 }]}>Multiple files allowed</Text> : null}
              </Pressable>
            ) : (
              <Pressable onPress={() => onRemove(slot.id, files[0].id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.sm }}>
                <Feather name="x" size={12} color={colors.textMuted} />
                <Text style={t.bodySm}>Replace file</Text>
              </Pressable>
            )}
          </View>
        );
      })}

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={styles.previewBg} onPress={() => setPreview(null)}>
          <Text style={[t.label, { marginBottom: space.md }]} numberOfLines={1}>
            {preview?.name}
          </Text>
          {preview ? <Image source={{ uri: preview.uri }} style={{ width: '100%', height: '70%' }} resizeMode="contain" /> : null}
          <Text style={[t.bodySm, { marginTop: space.lg }]}>Tap anywhere to close</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { backgroundColor: colors.surface, borderWidth: 1, borderRadius: radius.lg, padding: space.lg },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    paddingLeft: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  drop: {
    marginTop: space.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: space.lg,
  },
  previewBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center', padding: space.lg },
});
