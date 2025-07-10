import { createApp } from './src/app';
import { config } from './src/config/environment';

const { app } = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(`Backend server is running on http://${config.host}:${config.port}`);
});

export { app, server };
