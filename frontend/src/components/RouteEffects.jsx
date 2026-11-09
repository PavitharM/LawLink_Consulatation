import useDocumentTitle from '../hooks/useDocumentTitle';

/** Route-level side effects that need to live inside <Router>. */
const RouteEffects = () => {
  useDocumentTitle();
  return null;
};

export default RouteEffects;
