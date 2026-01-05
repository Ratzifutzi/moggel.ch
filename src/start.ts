import app from 'next/dist/cli/next-start';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
if (isNaN(port)) {
	throw new Error('Invalid PORT environment variable');
}

app.nextStart({
	port,
});
