import api from './api';

export const getArticles = async () => {
  return api.get('/articles');
};

export const getAllArticlesAdmin = async () => {
  return api.get('/articles/admin/all');
};

export const getArticleById = async (id) => {
  return api.get(`/articles/${id}`);
};

export const createArticle = async (data) => {
  return api.post('/articles', data);
};

export const updateArticle = async (id, data) => {
  return api.put(`/articles/${id}`, data);
};

export const deleteArticle = async (id) => {
  return api.delete(`/articles/${id}`);
};
