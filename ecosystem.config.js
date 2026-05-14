module.exports = {
    apps: [
        {
            name: 'kcis-report',
            script: 'dist/server.js',
            interpreter: 'bun',
            cwd: __dirname,
            env: {
                PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`
            },
            out_file: '/dev/null',
            error_file: '/dev/null'
        }
    ]
}
