FROM node:22-alpine
WORKDIR /app
COPY server.mjs ./
EXPOSE 4010
HEALTHCHECK --interval=5s --timeout=5s --start-period=5s --retries=10 CMD node -e "fetch('http://127.0.0.1:4010/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
