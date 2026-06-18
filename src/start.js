process.env.NODE_ENV = 'production';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const app = require('next/dist/cli/next-start');

app.nextStart({
	port: process.env.PORT || 3000,
});
