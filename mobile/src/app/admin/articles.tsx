import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { createArticle, deleteArticle, getAllArticlesAdmin, updateArticle } from '@/api/services';
import { Badge, Banner, Button, Card, Empty, IconButton, Input, Loader, PageHeader, Screen, SelectField, Sheet, Stat, StatGrid } from '@/components/ui';
import { colors, space, type as t } from '@/theme';

const CATEGORIES = ['Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Consumer Law', 'Property Law', 'Corporate Law'];

export default function ManageArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'new' | any>(null);
  const [form, setForm] = useState<any>({ title: '', category: 'Civil Law', excerpt: '' });
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await getAllArticlesAdmin();
      if (r.success) setArticles(r.data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const openModal = (a: any | 'new') => {
    setForm(a === 'new' ? { title: '', category: 'Civil Law', excerpt: '' } : { id: a.id, title: a.title, category: a.category, excerpt: a.excerpt, content: a.content || undefined });
    setModal(a);
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    try {
      const { id, ...rest } = form;
      const data = { ...rest, status };
      const r = id ? await updateArticle(id, data) : await createArticle(data);
      if (r.success) {
        load();
        setModal(null);
        flash(`Article ${status === 'PUBLISHED' ? 'published' : 'saved as draft'}.`);
      }
    } catch (e: any) {
      Alert.alert('Could not save', e?.errors?.[0]?.message || e?.message || 'Title needs 5+ characters and the excerpt 10+.');
    }
  };

  const handleDelete = (a: any) =>
    Alert.alert('Delete article?', a.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const r = await deleteArticle(a.id);
            if (r.success) {
              load();
              flash('Article deleted successfully.');
            }
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Could not delete.');
          }
        },
      },
    ]);

  if (loading) return <Loader />;

  const q = search.toLowerCase();
  const filtered = articles.filter((a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));

  return (
    <Screen>
      <PageHeader
        back
        index="Articles"
        eyebrow="Knowledge Hub"
        title="Manage Articles"
        subtitle="Create and manage legal knowledge articles for users."
        right={<IconButton name="plus" bg={colors.gold} color={colors.onGold} onPress={() => openModal('new')} />}
      />
      {toast ? <Banner text={toast} /> : null}

      <StatGrid>
        <Stat label="Total Articles" value={articles.length} tone="gold" />
        <Stat label="Published" value={articles.filter((a) => a.status === 'PUBLISHED').length} tone="success" />
        <Stat label="Drafts" value={articles.filter((a) => a.status === 'DRAFT').length} tone="neutral" style={{ minWidth: '100%' }} />
      </StatGrid>

      <Input icon="search" placeholder="Search articles by title or category..." value={search} onChangeText={setSearch} />

      {filtered.length === 0 ? <Empty icon="file-text" title="No articles found" /> : null}

      {filtered.map((a) => (
        <Card key={a.id} style={{ marginBottom: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Badge label={a.category} tone="gold" />
            <Badge label={a.status} tone={a.status === 'PUBLISHED' ? 'success' : 'neutral'} icon={a.status === 'PUBLISHED' ? 'check-circle' : 'clock'} />
            <View style={{ flex: 1 }} />
            <IconButton name="edit-2" size={14} onPress={() => openModal(a)} />
            <IconButton name="trash-2" size={14} color={colors.danger} bg={colors.dangerDim} onPress={() => handleDelete(a)} />
          </View>
          <Text style={[t.h3, { marginTop: space.md }]}>{a.title}</Text>
          <Text style={[t.bodySm, { marginTop: 4 }]} numberOfLines={3}>
            {a.excerpt}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.md }}>
            <Text style={t.meta}>✍️ {a.author?.name || 'Admin'}</Text>
            <Text style={t.meta}>
              📅 {new Date(a.createdAt).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}
              {a.status === 'PUBLISHED' ? `  👁️ ${a.views || 0}` : ''}
            </Text>
          </View>
        </Card>
      ))}

      <Sheet
        visible={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Create New Article' : 'Edit Article'}
        footer={
          <View style={{ gap: space.sm }}>
            <Button title="Publish Now" icon="save" disabled={!form.title || !form.excerpt} onPress={() => handleSave('PUBLISHED')} />
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setModal(null)} />
              <Button title="Save as Draft" variant="secondary" style={{ flex: 1 }} onPress={() => handleSave('DRAFT')} />
            </View>
          </View>
        }
      >
        <Input label="Article Title" required placeholder="Enter article title..." value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
        <SelectField label="Category" required value={form.category} options={CATEGORIES} onChange={(v) => setForm({ ...form, category: v })} />
        <Input
          label="Excerpt / Content Summary"
          required
          multiline
          style={{ minHeight: 120 }}
          placeholder="Write the article content or summary here..."
          value={form.excerpt}
          onChangeText={(v) => setForm({ ...form, excerpt: v })}
        />
      </Sheet>
    </Screen>
  );
}
