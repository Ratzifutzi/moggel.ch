# CONTENT OF THIS REPOSITORY & MOGGEL CARTOONS SHALL __**NOT**__ BE USED  FOR AI/ML/LLM, OR ANYTHING SIMILAR, TRAINING.
Official website: https://moggel.ch/
# Moggel Comic Web Server
![GitHub Actions Workflow Status](https://github.com/ratzifutzi/moggel.ch/actions/workflows/CI.yaml/badge.svg)

A web server for Moggel. This project uses Express.js with server-side rendering in TypeScript, designed to run on Plesk and interact with MongoDB.

## Features

- Express.js server with TypeScript
- Server-side rendering for optimal performance
- MongoDB integration for data storage
- Plesk-compatible for easy deployment

## Prerequisites

- Node.js v22.12.0 or later
- MongoDB v8.0.4 or later
- Optional but recommended: Plesk server environment

## Installation

1. Clone the repository:
```
git clone https://github.com/Ratzifutzi/moggel.ch.git
```

2. Install dependencies:
```
cd moggel.ch
npm install
```

3. Set up environment variables:
- Duplicate `.env.example` and name the copy to `.env`
- Update the variables with your MongoDB connection string and other configurations that should be self explanatory

4. Build the project:
```
npm run build
```

5. Start the server:
```
npm start
```


## Deployment on Plesk

1. Create a new Node.js application in Plesk
2. Set the application & document root to the project directory
3. Configure the Node.js version (22 or later)
4. Set the startup file to `dist/index.js`
5. Install dependencies using the Plesk interface or SSH

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
