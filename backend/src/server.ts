import app from './app';
import { env } from './config/env';

const startServer = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};



startServer();
